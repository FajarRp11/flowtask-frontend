"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useWorkspace } from "@/features/workspace/context/workspace-context";
import { useProject } from "@/features/project/hooks/use-project-queries";
import { canManageTask } from "../hooks/use-task-permissions";
import { useTask } from "../hooks/use-task-queries";
import { taskPriorityLabels, taskStatusLabels } from "../config";
import { DeleteTaskDialog, EditTaskDialog } from "./task-dialogs";

export function TaskDetail({ workspaceId, projectId, taskId }: { workspaceId: string; projectId: string; taskId: string }) {
    const { user } = useAuth();
    const { role: workspaceRole } = useWorkspace();
    const { data: task, isLoading: taskLoading, isError: taskError } = useTask(taskId);
    const { data: project, isLoading: projectLoading } = useProject(projectId);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    if (taskLoading || projectLoading) return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
    if (taskError || !task || !project) return <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">Failed to load task.</div>;
    const projectMember = project.members?.find((member) => String(member.id) === String(user?.id) || member.email === user?.email);
    const canManage = canManageTask(workspaceRole, projectMember?.role);
    return <div className="space-y-6"><Link href={`/workspaces/${workspaceId}/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to project</Link><div className="rounded-xl border bg-white p-6 shadow-xs dark:bg-zinc-900"><div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight">{task.title}</h1><Badge variant="secondary">{taskStatusLabels[task.status]}</Badge><Badge variant="outline">{taskPriorityLabels[task.priority]}</Badge></div><p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm text-muted-foreground">{task.description || "No description"}</p></div>{canManage && <div className="flex gap-2"><Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}><Pencil className="size-4" />Edit</Button><Button variant="destructive" className="gap-2" onClick={() => setDeleteOpen(true)}><Trash2 className="size-4" />Delete</Button></div>}</div><div className="mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-3"><div><p className="text-muted-foreground">Due date</p><p className="mt-1 flex items-center gap-1 font-medium"><CalendarDays className="size-3.5" />{task.due_date || "Not set"}</p></div><div><p className="text-muted-foreground">Project</p><p className="mt-1 font-medium">{project.name}</p></div><div><p className="text-muted-foreground">Assignees</p>{task.assignees?.length ? <div className="mt-1 flex flex-wrap gap-2">{task.assignees.map((assignee) => <span key={assignee.id} className="flex items-center gap-1.5 font-medium"><Avatar className="size-5"><AvatarImage src={assignee.avatar || undefined} /><AvatarFallback>{assignee.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>{assignee.name}</span>)}</div> : <p className="mt-1 font-medium">Unassigned</p>}</div></div></div><section className="rounded-xl border border-dashed p-8"><h2 className="font-semibold">Future task tools</h2><p className="mt-1 text-sm text-muted-foreground">Checklists, labels, comments, and assignee management will be added in a later feature.</p></section><EditTaskDialog projectId={projectId} task={task} open={editOpen} onOpenChange={setEditOpen} /><DeleteTaskDialog workspaceId={workspaceId} projectId={projectId} task={task} open={deleteOpen} onOpenChange={setDeleteOpen} /></div>;
}