"use client";

import React, { useState } from "react";
import { ProjectsView } from "@/components/ProjectsView";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { Project } from "@/types";

export default function ProjetosPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <ProjectsView onProjectClick={setSelectedProject} />
      {selectedProject && (
        <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  );
}
