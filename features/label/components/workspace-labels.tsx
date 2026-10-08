"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { useWorkspace } from "@/features/workspace/context/workspace-context";
import { useDeleteLabel, useWorkspaceLabels } from "../hooks/use-label-queries";
import { Label } from "../types";
import { LabelForm } from "./label-form";

export function WorkspaceLabels({ workspaceId }: { workspaceId: string }) {
  const { canManageWorkspace } = useWorkspace();
  const { data: labels = [], isLoading, isError } = useWorkspaceLabels(workspaceId);
  const deleteMutation = useDeleteLabel(workspaceId);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | undefined>();
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);
  const [error, setError] = useState<string | null>(null);
  const openCreate = () => { setEditingLabel(undefined); setFormOpen(true); };
  const openEdit = (label: Label) => { setEditingLabel(label); setFormOpen(true); };
  const handleDelete = async () => { if (!deletingLabel) return; try { setError(null); await deleteMutation.mutateAsync(deletingLabel.id); setDeletingLabel(null); } catch (caughtError) { setError(caughtError instanceof ApiError ? "Unable to delete label." : "An unexpected error occurred."); } };
  return <section className="space-y-3 border-t pt-5"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Labels</h3><p className="text-xs text-muted-foreground">Manage labels available in this workspace.</p></div>{canManageWorkspace && <Button size="sm" variant="outline" className="gap-2" onClick={openCreate}><Plus className="size-4" />Create label</Button>}</div>{error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</div>}{isLoading ? <div className="space-y-2"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /></div> : isError ? <p className="text-sm text-red-600 dark:text-red-400">Failed to load labels.</p> : labels.length === 0 ? <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">No labels yet.</div> : <div className="space-y-2">{labels.map((label) => <div key={label.id} className="flex items-center gap-3 rounded-lg border p-2"><span className="size-3 rounded-full" style={{ backgroundColor: label.color }} /><Badge variant="outline" style={{ borderColor: label.color, color: label.color }}>{label.name}</Badge><span className="flex-1" />{canManageWorkspace && <><Button type="button" variant="ghost" size="icon-sm" onClick={() => openEdit(label)} aria-label={`Edit ${label.name}`}><Pencil className="size-4" /></Button><Button type="button" variant="ghost" size="icon-sm" className="text-red-600" onClick={() => setDeletingLabel(label)} aria-label={`Delete ${label.name}`}><Trash2 className="size-4" /></Button></>}</div>)}</div>}
    <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent><DialogHeader><DialogTitle>{editingLabel ? "Edit label" : "Create label"}</DialogTitle><DialogDescription>{editingLabel ? "Update label name or color." : "Create a label for this workspace."}</DialogDescription></DialogHeader><LabelForm workspaceId={workspaceId} label={editingLabel} onSuccess={() => setFormOpen(false)} onCancel={() => setFormOpen(false)} /></DialogContent></Dialog>
    <AlertDialog open={!!deletingLabel} onOpenChange={(open) => !open && setDeletingLabel(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete “{deletingLabel?.name}”?</AlertDialogTitle><AlertDialogDescription>This removes label from workspace. Backend controls task relationship behavior.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel><AlertDialogAction onClick={(event) => { event.preventDefault(); void handleDelete(); }} disabled={deleteMutation.isPending} className="bg-red-600 text-white hover:bg-red-700">{deleteMutation.isPending ? "Deleting..." : "Delete label"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}