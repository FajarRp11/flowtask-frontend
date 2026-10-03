"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWorkspaceSchema, UpdateWorkspaceInput } from "../schemas";
import { useUpdateWorkspace } from "../hooks/use-workspace-queries";
import { useWorkspace } from "../context/workspace-context";
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import { ApiError } from "@/lib/api/client";
import { Workspace } from "../types";

interface WorkspaceSettingsDialogProps {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceSettingsDialog({
  workspace,
  open,
  onOpenChange,
}: WorkspaceSettingsDialogProps) {
  const { canManageWorkspace, canDeleteWorkspace } = useWorkspace();
  const updateMutation = useUpdateWorkspace();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || "",
    },
  });

  useEffect(() => {
    reset({
      name: workspace.name,
      description: workspace.description || "",
    });
  }, [workspace, reset]);

  const onSubmit = async (data: UpdateWorkspaceInput) => {
    try {
      setServerError(null);
      setSuccessMessage(null);
      await updateMutation.mutateAsync({
        id: workspace.id,
        payload: data,
      });
      setSuccessMessage("Pengaturan workspace berhasil diperbarui.");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.data?.errors) {
          Object.entries(err.data.errors).forEach(([field, messages]) => {
            const msgArray = messages as string[];
            if (field === "name" || field === "description") {
              setError(field as keyof UpdateWorkspaceInput, {
                type: "server",
                message: msgArray[0],
              });
            }
          });
        } else {
          setServerError(
            err.message || "Gagal memperbarui workspace."
          );
        }
      } else {
        setServerError("Terjadi kesalahan yang tidak terduga.");
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pengaturan Workspace</DialogTitle>
            <DialogDescription>
              Kelola informasi dan preferensi workspace Anda.
            </DialogDescription>
          </DialogHeader>

          {serverError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950/50 dark:text-green-400">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Nama Workspace
              </label>
              <Input
                id="name"
                disabled={!canManageWorkspace || updateMutation.isPending}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Deskripsi
              </label>
              <Input
                id="description"
                disabled={!canManageWorkspace || updateMutation.isPending}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {canManageWorkspace && (
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={!isDirty || updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            )}
          </form>

          {canDeleteWorkspace && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">
                Zona Bahaya
              </h4>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400/80">
                Menghapus workspace akan menghapus semua proyek, tugas, dan data terkait secara permanen.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-3"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Hapus Workspace
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {canDeleteWorkspace && (
        <DeleteWorkspaceDialog
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}
