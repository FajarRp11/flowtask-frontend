"use client";

import { use } from "react";
import { WorkspaceDetail } from "@/features/workspace/components/workspace-detail";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const resolvedParams = use(params);
  const workspaceId = resolvedParams.workspaceId;

  return <WorkspaceDetail workspaceId={workspaceId} />;
}
