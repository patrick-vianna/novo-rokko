"use client";

import React from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export function GlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const color = (style?.stroke as string) || "#00fff5";

  return (
    <>
      <defs>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Glow layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={selected ? 4 : 2}
        strokeOpacity={0.15}
        filter={`url(#glow-${id})`}
      />

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: `url(#grad-${id})`,
          strokeWidth: selected ? 2 : 1.5,
          ...style,
        }}
      />

      {/* Animated particle */}
      <circle r="2.5" fill={color} opacity="0.9">
        <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
}
