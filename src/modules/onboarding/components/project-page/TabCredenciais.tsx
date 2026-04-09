"use client";

import React from "react";
import { CredentialsPanel } from "@/components/CredentialsPanel";

export function TabCredenciais({ projectId }: { projectId: string }) {
  return <CredentialsPanel projectId={projectId} />;
}
