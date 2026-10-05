"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useWorkspace } from "@/features/workspace/context/workspace-context";
import { projectPriorityLabels, projectStatusLabels, projectRoleLabels } from "../config";
import { useProject } from "../hooks/use-project-queries";
import { canDeleteProject, canManageProject, isProjectManager } from "../hooks/use-project-permissions";
import { DeleteProjectDialog, EditProjectDialog } from "./project-dialogs";
import { ProjectMembers } from "./project-members";
import { TaskBoard } from "@/features/task/components/task-board";

export function ProjectDetail({ workspaceId, projectId }: { workspaceId: string; projectId: string }) {
    const { user } = useAuth();
    const { role: workspaceRole } = useWorkspace();
    const { data: project, isLoading, isError } = useProject(projectId);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    if (isLoading) return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
    if (isError || !project || project.workspace.id !== workspaceId) return <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">Failed to load project.</div>;
    const currentMember = project.members?.find(
        (member) => String(member.id) === String(user?.id) || member.email === user?.email,
    );
    const projectRole = currentMember?.role || null;
    const canManage = canManageProject(workspaceRole, projectRole);
    return <div className="space-y-6"><Link href={`/workspaces/${workspaceId}/projects`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to projects</Link><div className="rounded-xl border bg-white p-6 shadow-xs dark:bg-zinc-900"><div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">{project.name}</h1><Badge variant="secondary">{projectStatusLabels[project.status]}</Badge><Badge variant="outline">{projectPriorityLabels[project.priority]}</Badge></div><p className="mt-3 max-w-2xl text-sm text-muted-foreground">{project.description || "No description"}</p></div>{canManage && <div className="flex gap-2"><Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}><Pencil className="size-4" />Edit</Button>{canDeleteProject(workspaceRole, projectRole) && <Button variant="destructive" className="gap-2" onClick={() => setDeleteOpen(true)}><Trash2 className="size-4" />Delete</Button>}</div>}</div><div className="mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-4"><div><p className="text-muted-foreground">Start date</p><p className="mt-1 flex items-center gap-1 font-medium"><CalendarDays className="size-3.5" />{project.start_date || "Not set"}</p></div><div><p className="text-muted-foreground">Due date</p><p className="mt-1 flex items-center gap-1 font-medium"><CalendarDays className="size-3.5" />{project.due_date || "Not set"}</p></div><div><p className="text-muted-foreground">Workspace</p><p className="mt-1 font-medium">{project.workspace.name}</p></div><div><p className="text-muted-foreground">Your project role</p><p className="mt-1 font-medium">{projectRole ? projectRoleLabels[projectRole] : "Workspace member"}{isProjectManager(projectRole) ? " (Manager)" : ""}</p></div></div></div><ProjectMembers projectId={project.id} workspaceId={workspaceId} canManage={canManage} /><TaskBoard projectId={project.id} workspaceId={workspaceId} canManage={canManage} /><EditProjectDialog project={project} workspaceId={workspaceId} open={editOpen} onOpenChange={setEditOpen} /><DeleteProjectDialog project={project} workspaceId={workspaceId} open={deleteOpen} onOpenChange={setDeleteOpen} /></div>;
}