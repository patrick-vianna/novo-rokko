"use client";

import { useParams } from "next/navigation";
import { ProjectPage } from "@/modules/onboarding/components/project-page/ProjectPage";

export default function ProjectDetailPage() {
  const params = useParams();
  return <ProjectPage projectId={params.id as string} />;
}
