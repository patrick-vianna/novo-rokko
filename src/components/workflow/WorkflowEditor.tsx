"use client";

import React, { useCallback, useRef, useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { WorkflowSidebar } from "./WorkflowSidebar";
import { WorkflowToolbar } from "./WorkflowToolbar";
import { WorkflowConfigPanel } from "./WorkflowConfigPanel";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";
import { TriggerNode } from "./nodes/TriggerNode";
import { ActionNode } from "./nodes/ActionNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { DelayNode } from "./nodes/DelayNode";
import { WebhookNode } from "./nodes/WebhookNode";
import { NotificationNode } from "./nodes/NotificationNode";
import { DatabaseNode } from "./nodes/DatabaseNode";
import { StageChangeNode } from "./nodes/StageChangeNode";
import { GlowEdge } from "./edges/GlowEdge";
import { NODE_COLORS, type NodeType } from "@/lib/workflow-types";
import toast from "react-hot-toast";
import {
  Settings, Copy, Clipboard, Power, Trash2, Plus, MousePointer,
  Maximize, Zap, Play, GitBranch, Timer, Scissors,
} from "lucide-react";

const nodeTypes = {
  trigger: TriggerNode,
  stage_change: StageChangeNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  webhook: WebhookNode,
  notification: NotificationNode,
  database: DatabaseNode,
};

const edgeTypes = {
  glow: GlowEdge,
};

// Default data for quick-add from canvas context menu
const QUICK_ADD_NODES: { type: NodeType; label: string; icon: React.ReactNode; data: Record<string, any> }[] = [
  { type: "trigger", label: "Trigger", icon: <Zap size={13} />, data: { label: "Trigger", icon: "Zap", config: { triggerType: "manual" } } },
  { type: "action", label: "Ação", icon: <Play size={13} />, data: { label: "Ação", icon: "Play", config: { actionType: "custom" } } },
  { type: "condition", label: "Condição", icon: <GitBranch size={13} />, data: { label: "Condição", icon: "GitBranch", config: { expression: "" } } },
  { type: "delay", label: "Delay", icon: <Timer size={13} />, data: { label: "Delay", icon: "Timer", config: { seconds: 60 } } },
];

interface WorkflowEditorProps {
  workflowId?: string;
  initialName?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  initialActive?: boolean;
}

// ─── Undo stack entry ───
interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

function WorkflowEditorInner({
  workflowId,
  initialName = "",
  initialNodes = [],
  initialEdges = [],
  initialActive = false,
}: WorkflowEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [name, setName] = useState(initialName);
  const [active, setActive] = useState(initialActive);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // ─── Clipboard ───
  const clipboardRef = useRef<Node | null>(null);

  // ─── Undo stack ───
  const undoStackRef = useRef<HistoryEntry[]>([]);
  const isUndoingRef = useRef(false);

  const pushUndo = useCallback(() => {
    undoStackRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    // Keep max 50 entries
    if (undoStackRef.current.length > 50) undoStackRef.current.shift();
  }, [nodes, edges]);

  const performUndo = useCallback(() => {
    const entry = undoStackRef.current.pop();
    if (!entry) return;
    isUndoingRef.current = true;
    setNodes(entry.nodes);
    setEdges(entry.edges);
    setTimeout(() => { isUndoingRef.current = false; }, 0);
  }, [setNodes, setEdges]);

  // ─── Context menu state ───
  type MenuTarget =
    | { kind: "node"; node: Node }
    | { kind: "edge"; edge: Edge }
    | { kind: "pane" };

  const [menu, setMenu] = useState<{ x: number; y: number; target: MenuTarget } | null>(null);

  const closeMenu = useCallback(() => setMenu(null), []);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  );

  // ─── Core operations ───

  const addNodeAtPosition = useCallback(
    (type: NodeType, data: Record<string, any>, position: { x: number; y: number }) => {
      pushUndo();
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data,
      };
      setNodes((nds) => [...nds, newNode]);
      return newNode;
    },
    [setNodes, pushUndo],
  );

  const deleteNodes = useCallback(
    (nodeIds: string[]) => {
      if (nodeIds.length === 0) return;
      pushUndo();
      setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
      setEdges((eds) => eds.filter((e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));
      if (selectedNodeId && nodeIds.includes(selectedNodeId)) setSelectedNodeId(null);
    },
    [setNodes, setEdges, selectedNodeId, pushUndo],
  );

  const deleteEdges = useCallback(
    (edgeIds: string[]) => {
      if (edgeIds.length === 0) return;
      pushUndo();
      setEdges((eds) => eds.filter((e) => !edgeIds.includes(e.id)));
    },
    [setEdges, pushUndo],
  );

  const duplicateNode = useCallback(
    (node: Node) => {
      pushUndo();
      const newNode: Node = {
        id: `${node.type}-${Date.now()}`,
        type: node.type,
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        data: JSON.parse(JSON.stringify(node.data)),
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, pushUndo],
  );

  const copyNode = useCallback((node: Node) => {
    clipboardRef.current = JSON.parse(JSON.stringify(node));
    toast.success("Nó copiado");
  }, []);

  const pasteNode = useCallback(
    (position: { x: number; y: number }) => {
      const src = clipboardRef.current;
      if (!src) return;
      pushUndo();
      const newNode: Node = {
        id: `${src.type}-${Date.now()}`,
        type: src.type,
        position,
        data: JSON.parse(JSON.stringify(src.data)),
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, pushUndo],
  );

  const toggleNodeDisabled = useCallback(
    (nodeId: string) => {
      pushUndo();
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const disabled = !(n.data as any).disabled;
          return {
            ...n,
            data: { ...n.data, disabled },
            style: disabled
              ? { opacity: 0.4, pointerEvents: "none" as const }
              : { opacity: 1, pointerEvents: "auto" as const },
          };
        }),
      );
    },
    [setNodes, pushUndo],
  );

  const selectAll = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
  }, [setNodes, setEdges]);

  const insertNodeOnEdge = useCallback(
    (edge: Edge, type: NodeType, data: Record<string, any>) => {
      pushUndo();
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const midX = (sourceNode.position.x + targetNode.position.x) / 2;
      const midY = (sourceNode.position.y + targetNode.position.y) / 2;

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: midX, y: midY },
        data,
      };

      // Remove old edge, add node, add two new edges
      setEdges((eds) => {
        const filtered = eds.filter((e) => e.id !== edge.id);
        const color1 = sourceNode ? NODE_COLORS[sourceNode.type as NodeType] || "#00fff5" : "#00fff5";
        const color2 = NODE_COLORS[type] || "#00fff5";
        return [
          ...filtered,
          { id: `e-${edge.source}-${newNode.id}`, source: edge.source, target: newNode.id, sourceHandle: edge.sourceHandle, type: "glow", animated: true, style: { stroke: color1 } } as Edge,
          { id: `e-${newNode.id}-${edge.target}`, source: newNode.id, target: edge.target, targetHandle: edge.targetHandle, type: "glow", animated: true, style: { stroke: color2 } } as Edge,
        ];
      });
      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, setNodes, setEdges, pushUndo],
  );

  // ─── Context menu builders ───

  const buildNodeMenu = useCallback(
    (node: Node): ContextMenuItem[] => {
      const isDisabled = !!(node.data as any).disabled;
      return [
        { label: "Editar configuração", icon: <Settings size={13} />, shortcut: "Dbl-click", onClick: () => setSelectedNodeId(node.id) },
        { label: "Duplicar nó", icon: <Copy size={13} />, shortcut: "Ctrl+D", onClick: () => duplicateNode(node) },
        { label: "Copiar nó", icon: <Clipboard size={13} />, shortcut: "Ctrl+C", onClick: () => copyNode(node) },
        { label: isDisabled ? "Ativar nó" : "Desativar nó", icon: <Power size={13} />, onClick: () => toggleNodeDisabled(node.id) },
        { label: "", separator: true },
        { label: "Deletar nó", icon: <Trash2 size={13} />, shortcut: "Del", danger: true, onClick: () => deleteNodes([node.id]) },
      ];
    },
    [duplicateNode, copyNode, toggleNodeDisabled, deleteNodes],
  );

  const buildPaneMenu = useCallback(
    (screenPos: { x: number; y: number }): ContextMenuItem[] => {
      const flowPos = screenToFlowPosition(screenPos);
      const hasClipboard = !!clipboardRef.current;

      const addItems: ContextMenuItem[] = QUICK_ADD_NODES.map((n) => ({
        label: `Adicionar ${n.label}`,
        icon: n.icon,
        onClick: () => addNodeAtPosition(n.type, n.data, flowPos),
      }));

      return [
        ...addItems,
        { label: "", separator: true },
        { label: "Colar nó", icon: <Clipboard size={13} />, shortcut: "Ctrl+V", disabled: !hasClipboard, onClick: () => pasteNode(flowPos) },
        { label: "Selecionar tudo", icon: <MousePointer size={13} />, shortcut: "Ctrl+A", onClick: selectAll },
        { label: "Zoom pra caber tudo", icon: <Maximize size={13} />, onClick: () => fitView() },
      ];
    },
    [screenToFlowPosition, addNodeAtPosition, pasteNode, selectAll, fitView],
  );

  const buildEdgeMenu = useCallback(
    (edge: Edge): ContextMenuItem[] => [
      {
        label: "Adicionar nó nesta conexão",
        icon: <Plus size={13} />,
        onClick: () => insertNodeOnEdge(edge, "action", { label: "Ação", icon: "Play", config: { actionType: "custom" } }),
      },
      { label: "", separator: true },
      { label: "Deletar conexão", icon: <Scissors size={13} />, danger: true, onClick: () => deleteEdges([edge.id]) },
    ],
    [insertNodeOnEdge, deleteEdges],
  );

  // ─── React Flow event handlers ───

  const onConnect = useCallback(
    (connection: Connection) => {
      pushUndo();
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const color = sourceNode
        ? NODE_COLORS[sourceNode.type as NodeType] || "#00fff5"
        : "#00fff5";

      setEdges((eds) =>
        addEdge(
          { ...connection, type: "glow", animated: true, style: { stroke: color } },
          eds,
        ),
      );
    },
    [nodes, setEdges, pushUndo],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/reactflow");
      if (!raw) return;

      const { type, data } = JSON.parse(raw) as { type: NodeType; data: Record<string, any> };
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNodeAtPosition(type, data, position);
    },
    [screenToFlowPosition, addNodeAtPosition],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    closeMenu();
  }, [closeMenu]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setMenu({ x: event.clientX, y: event.clientY, target: { kind: "node", node } });
    },
    [],
  );

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      setMenu({ x: event.clientX, y: event.clientY, target: { kind: "pane" } });
    },
    [],
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setMenu({ x: event.clientX, y: event.clientY, target: { kind: "edge", edge } });
    },
    [],
  );

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleUpdateNodeData = useCallback(
    (nodeId: string, newData: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n,
        ),
      );
    },
    [setNodes],
  );

  // ─── Keyboard shortcuts ───

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Delete / Backspace → delete selected nodes & edges
      if (e.key === "Delete" || e.key === "Backspace") {
        const selectedNodes = nodes.filter((n) => n.selected).map((n) => n.id);
        const selectedEdges = edges.filter((e) => e.selected).map((e) => e.id);
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          e.preventDefault();
          if (selectedNodes.length > 0) deleteNodes(selectedNodes);
          if (selectedEdges.length > 0) deleteEdges(selectedEdges);
        }
      }

      // Ctrl+C → copy
      if (ctrl && e.key === "c") {
        const sel = nodes.find((n) => n.selected);
        if (sel) {
          e.preventDefault();
          copyNode(sel);
        }
      }

      // Ctrl+V → paste at center
      if (ctrl && e.key === "v") {
        if (clipboardRef.current) {
          e.preventDefault();
          const center = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          });
          pasteNode(center);
        }
      }

      // Ctrl+D → duplicate
      if (ctrl && e.key === "d") {
        const sel = nodes.find((n) => n.selected);
        if (sel) {
          e.preventDefault();
          duplicateNode(sel);
        }
      }

      // Ctrl+A → select all
      if (ctrl && e.key === "a") {
        e.preventDefault();
        selectAll();
      }

      // Ctrl+Z → undo
      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        performUndo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nodes, edges, deleteNodes, deleteEdges, copyNode, pasteNode, duplicateNode, selectAll, performUndo, screenToFlowPosition]);

  // ─── Build menu items for current target ───

  const menuItems = useMemo((): ContextMenuItem[] => {
    if (!menu) return [];
    switch (menu.target.kind) {
      case "node":
        return buildNodeMenu(menu.target.node);
      case "pane":
        return buildPaneMenu({ x: menu.x, y: menu.y });
      case "edge":
        return buildEdgeMenu(menu.target.edge);
    }
  }, [menu, buildNodeMenu, buildPaneMenu, buildEdgeMenu]);

  // ─── Save / Execute ───

  const handleSave = async () => {
    setSaving(true);
    try {
      const flowData = { nodes, edges };
      const url = workflowId ? `/api/workflows/${workflowId}` : "/api/workflows";
      const method = workflowId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Sem título", flow_data: flowData, active }),
      });

      if (!res.ok) throw new Error("Falha ao salvar");
      const data = await res.json();

      if (!workflowId && data.id) {
        window.history.replaceState(null, "", `/automacoes/${data.id}`);
      }

      toast.success("Workflow salvo!");
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await fetch("/api/workflows/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: workflowId || "draft", nodes, edges }),
      });

      if (!res.ok) throw new Error("Falha ao executar");
      const data = await res.json();
      toast.success(`Execução iniciada! Run ID: ${data.runId}`);
    } catch (err: any) {
      toast.error(`Erro ao executar: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  // ─── Render ───

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <WorkflowToolbar
        name={name}
        onNameChange={setName}
        active={active}
        onToggleActive={() => setActive(!active)}
        onSave={handleSave}
        onExecute={handleExecute}
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        onFitView={() => fitView()}
        saving={saving}
        executing={executing}
        historyHref={workflowId ? `/automacoes/${workflowId}/execucoes` : undefined}
      />

      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar />

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={onPaneClick}
            onNodeContextMenu={onNodeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: "glow", animated: true }}
            fitView
            proOptions={{ hideAttribution: true }}
            className="!bg-zinc-950"
            deleteKeyCode={null}
            selectionKeyCode="Shift"
            multiSelectionKeyCode="Shift"
          >
            <Background color="#ffffff10" gap={20} size={1} />
            <Controls
              className="!bg-zinc-900 !border-zinc-800 !rounded-md [&>button]:!bg-zinc-900 [&>button]:!border-zinc-800 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800 [&>button:hover]:!text-white"
              showInteractive={false}
            />
            <MiniMap
              className="!bg-zinc-900 !border-zinc-800 !rounded-md"
              nodeColor={(n) => NODE_COLORS[n.type as NodeType] || "#555"}
              maskColor="rgba(0, 0, 0, 0.7)"
            />
          </ReactFlow>

          {/* Context menu overlay */}
          {menu && (
            <ContextMenu
              x={menu.x}
              y={menu.y}
              items={menuItems}
              onClose={closeMenu}
            />
          )}
        </div>

        {selectedNode && (
          <WorkflowConfigPanel
            node={selectedNode}
            onUpdate={(data) => handleUpdateNodeData(selectedNode.id, data)}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}

export function WorkflowEditor(props: WorkflowEditorProps) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner {...props} />
    </ReactFlowProvider>
  );
}
