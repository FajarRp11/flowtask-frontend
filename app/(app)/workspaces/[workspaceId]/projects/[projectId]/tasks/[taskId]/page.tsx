"use client";

import { use } from "react";
import { TaskDetail } from "@/features/task/components/task-detail";

export default function TaskPage({ params }: { params: Promise<{ workspaceId: string; projectId: string; taskId: string }> }) {
    const { workspaceId, projectId, taskId } = use(params);
    return <TaskDetail workspaceId={workspaceId} projectId={projectId} taskId={taskId} />;
}