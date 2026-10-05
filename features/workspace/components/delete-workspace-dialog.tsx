"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteWorkspace } from "../hooks/use-workspace-queries";
import { useWorkspace } from "../context/workspace-context";
import { ApiError } from "@/lib/api/client";

interface DeleteWorkspaceDialogProps {
  workspaceId: string;
  workspaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
}: DeleteWorkspaceDialogProps) {
  const router = useRouter();
  const deleteMutation = useDeleteWorkspace();
  const { setSelectedWorkspaceId, workspaces } = useWorkspace();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setError(null);
      await deleteMutation.mutateAsync(workspaceId);
      onOpenChange(false);
      const remaining = workspaces.filter((w) => w.id !== workspaceId);
      if (remaining.length > 0) {
        setSelectedWorkspaceId(remaining[0].id);
        router.push(`/workspaces/${remaining[0].id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Gagal menghapus workspace.");
      } else {
        setError("Terjadi kesalahan yang tidak terduga.");
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Hapus Workspace "{workspaceName}"?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Seluruh data proyek, tugas, dan
            anggota di dalam workspace ini akan terhapus secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus Workspace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
