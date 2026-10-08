"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { useWorkspaceLabels } from "../hooks/use-label-queries";
import { useAddTaskLabel, useRemoveTaskLabel, useTaskLabels } from "../hooks/use-label-queries";
import { Label } from "../types";

function labelStyle(label: Label) {
  return { borderColor: label.color, color: label.color, backgroundColor: `${label.color}15` };
}

export function TaskLabels({ taskId, workspaceId, canManage }: { taskId: string; workspaceId: string; canManage: boolean }) {
  const { data: labels = [], isLoading, isError } = useTaskLabels(taskId);
  const { data: workspaceLabels = [], isLoading: workspaceLabelsLoading } = useWorkspaceLabels(workspaceId);
  const addMutation = useAddTaskLabel(taskId);
  const removeMutation = useRemoveTaskLabel(taskId);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const assignedIds = new Set(labels.map((label) => label.id));
  const availableLabels = workspaceLabels.filter((label) => !assignedIds.has(label.id) && label.name.toLowerCase().includes(search.toLowerCase()));
  const handleAdd = async (labelId: string) => { try { setError(null); await addMutation.mutateAsync(labelId); setSearch(""); } catch (caughtError) { setError(caughtError instanceof ApiError ? "Unable to add label." : "An unexpected error occurred."); } };
  const handleRemove = async (labelId: string) => { try { setError(null); await removeMutation.mutateAsync(labelId); } catch (caughtError) { setError(caughtError instanceof ApiError ? "Unable to remove label." : "An unexpected error occurred."); } };
  return <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Labels</h2>{canManage && <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)} aria-label="Add label to task"><Plus className="size-4" />Add label</Button>}</div>{isError ? <p className="text-sm text-red-600 dark:text-red-400">Failed to load labels.</p> : isLoading ? <div className="flex gap-2"><Skeleton className="h-7 w-16" /><Skeleton className="h-7 w-20" /></div> : labels.length === 0 ? <p className="text-sm text-muted-foreground">No labels</p> : <div className="flex flex-wrap gap-2">{labels.map((label) => <Badge key={label.id} variant="outline" style={labelStyle(label)} className="gap-1">{label.name}{canManage && <button type="button" onClick={() => void handleRemove(label.id)} disabled={removeMutation.isPending} aria-label={`Remove ${label.name}`}><X className="size-3" /></button>}</Badge>)}</div>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add label</DialogTitle><DialogDescription>Select a label from this workspace.</DialogDescription></DialogHeader>{error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</div>}<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search labels..." aria-label="Search workspace labels" />{workspaceLabelsLoading ? <div className="space-y-2"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /></div> : availableLabels.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">{workspaceLabels.length === labels.length ? "All workspace labels assigned" : "No matching labels"}</p> : <div className="max-h-64 space-y-1 overflow-y-auto">{availableLabels.map((label) => <button key={label.id} type="button" className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted disabled:opacity-50" onClick={() => void handleAdd(label.id)} disabled={addMutation.isPending}><span className="size-3 rounded-full" style={{ backgroundColor: label.color }} /><span className="flex-1 truncate text-sm">{label.name}</span><Badge variant="outline" style={labelStyle(label)}>{label.name}</Badge></button>)}</div>}<DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Done</Button></DialogFooter></DialogContent></Dialog>
  </section>;
}