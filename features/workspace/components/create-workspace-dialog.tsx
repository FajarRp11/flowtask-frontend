"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

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
import { createWorkspaceSchema, CreateWorkspaceInput } from "../schemas";
import { useCreateWorkspace } from "../hooks/use-workspace-queries";
import { useWorkspace } from "../context/workspace-context";
import { ApiError } from "@/lib/api/client";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const { setSelectedWorkspaceId } = useWorkspace();
  const createMutation = useCreateWorkspace();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateWorkspaceInput) => {
    try {
      setServerError(null);
      const newWorkspace = await createMutation.mutateAsync(data);
      reset();
      onOpenChange(false);
      setSelectedWorkspaceId(newWorkspace.id);
      router.push(`/workspaces/${newWorkspace.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.data?.errors) {
          Object.entries(err.data.errors).forEach(([field, messages]) => {
            const msgArray = messages as string[];
            if (field === "name" || field === "description") {
              setError(field as keyof CreateWorkspaceInput, {
                type: "server",
                message: msgArray[0],
              });
            }
          });
        } else {
          setServerError(
            err.message || "Gagal membuat workspace. Silakan coba lagi.",
          );
        }
      } else {
        setServerError("Terjadi kesalahan yang tidak terduga.");
      }
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setServerError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Workspace Baru</DialogTitle>
          <DialogDescription>
            Workspace membantu tim Anda mengorganisasi proyek dan tugas secara
            efisien.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {serverError}
          </div>
        )}

        <form
          id="create-workspace-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nama Workspace <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              placeholder="Contoh: Tim Pengembang, Marketing"
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
              Deskripsi (Opsional)
            </label>
            <Input
              id="description"
              placeholder="Jelaskan tujuan workspace ini..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={createMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Membuat..." : "Buat Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
