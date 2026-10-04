"use client";

import { use } from "react";
import { ProjectDetail } from "@/features/project/components/project-detail";

export default function ProjectPage({
    params,
}: {
    params: Promise<{ workspaceId: string; projectId: string }>;
}) {
    const { workspaceId, projectId } = use(params);
    return <ProjectDetail workspaceId={workspaceId} projectId={projectId} />;
}