"use client";

import React, { useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { Project } from "@/types";

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <KanbanBoard onProjectClick={setSelectedProject} />
      {selectedProject && (
        <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  );
}
