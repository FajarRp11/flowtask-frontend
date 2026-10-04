"use client";

import { use } from "react";
import { ProjectList } from "@/features/project/components/project-list";

export default function ProjectsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
    return <ProjectList workspaceId={use(params).workspaceId} />;
}