"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectMembers } from "@/features/project/hooks/use-project-queries";
import { ApiError } from "@/lib/api/client";
import { useAddTaskAssignee, useRemoveTaskAssignee, useTaskAssignees } from "../hooks/use-task-queries";
import { TaskAssignee } from "../types";

function initials(name: string) {
    return name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
}

export function TaskAssignees({ taskId, projectId, canManage }: { taskId: string; projectId: string; canManage: boolean }) {
    const { data: assignees = [], isLoading, isError } = useTaskAssignees(taskId);
    const { data: projectMembers = [], isLoading: membersLoading } = useProjectMembers(projectId);
    const addMutation = useAddTaskAssignee(taskId);
    const removeMutation = useRemoveTaskAssignee(taskId);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const assignedIds = new Set(assignees.map((assignee) => assignee.id));
    const availableMembers = projectMembers.filter((member) => !assignedIds.has(member.id) && `${member.name} ${member.email}`.toLowerCase().includes(search.toLowerCase()));
    const handleAdd = async (userId: string) => {
        try { setError(null); await addMutation.mutateAsync(userId); setSearch(""); } catch (caughtError) { setError(caughtError instanceof ApiError ? "Unable to assign this project member." : "Unable to assign member."); }
    };
    const handleRemove = async (assignee: TaskAssignee) => {
        try { setError(null); await removeMutation.mutateAsync(assignee.id); } catch (caughtError) { setError(caughtError instanceof ApiError ? "Unable to remove this assignee." : "Unable to remove assignee."); }
    };
    return <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Assignees</h2>{canManage && <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)} aria-label="Assign task members"><UserPlus className="size-4" />Assign</Button>}</div>{isError ? <p className="text-sm text-red-600 dark:text-red-400">Failed to load assignees.</p> : isLoading ? <div className="flex gap-2"><Skeleton className="size-8 rounded-full" /><Skeleton className="h-8 w-24" /></div> : assignees.length === 0 ? <p className="text-sm text-muted-foreground">No assignees</p> : <div className="flex flex-wrap gap-2">{assignees.map((assignee) => <div key={assignee.id} className="flex items-center gap-2 rounded-full border px-2 py-1"><Avatar className="size-6"><AvatarImage src={assignee.avatar || undefined} /><AvatarFallback>{initials(assignee.name)}</AvatarFallback></Avatar><span className="max-w-40 truncate text-sm">{assignee.name}</span>{canManage && <Button type="button" variant="ghost" size="icon-xs" onClick={() => void handleRemove(assignee)} disabled={removeMutation.isPending} aria-label={`Remove ${assignee.name}`}><X className="size-3.5" /></Button>}</div>)}</div>}
        <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Assign members</DialogTitle><DialogDescription>Select members already assigned to this project.</DialogDescription></DialogHeader>{error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</div>}<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members..." aria-label="Search project members" />{membersLoading ? <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : availableMembers.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">{projectMembers.length === assignees.length ? "All project members assigned" : "No matching project members"}</p> : <div className="max-h-64 space-y-1 overflow-y-auto">{availableMembers.map((member) => <button key={member.id} type="button" className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted disabled:opacity-50" onClick={() => void handleAdd(member.id)} disabled={addMutation.isPending}><Avatar className="size-8"><AvatarImage src={member.avatar || undefined} /><AvatarFallback>{initials(member.name)}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{member.name}</span><span className="block truncate text-xs text-muted-foreground">{member.email}</span></span><UserPlus className="size-4 text-muted-foreground" /></button>)}</div>}<DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Done</Button></DialogFooter></DialogContent></Dialog>
    </section>;
}