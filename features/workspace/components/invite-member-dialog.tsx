"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMemberSchema, InviteMemberInput } from "../schemas";
import { useAddWorkspaceMember } from "../hooks/use-workspace-queries";
import { ApiError } from "@/lib/api/client";

interface InviteMemberDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({
  workspaceId,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const addMemberMutation = useAddWorkspaceMember(workspaceId);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      user_id: "",
      role: "member",
    },
  });

  const onSubmit = async (data: InviteMemberInput) => {
    try {
      setServerError(null);
      await addMemberMutation.mutateAsync(data);
      reset();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.data?.errors) {
          Object.entries(err.data.errors).forEach(([field, messages]) => {
            const msgArray = messages as string[];
            if (field === "user_id" || field === "role") {
              setError(field as keyof InviteMemberInput, {
                type: "server",
                message: msgArray[0],
              });
            }
          });
        } else {
          setServerError(
            err.message || "Gagal menambahkan anggota. Silakan coba lagi."
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
          <DialogTitle>Tambah Anggota Workspace</DialogTitle>
          <DialogDescription>
            Masukkan User ID (UUID) dan tentukan peran pengguna di workspace ini.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="user_id"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              User ID (UUID) <span className="text-red-500">*</span>
            </label>
            <Input
              id="user_id"
              placeholder="Contoh: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
              {...register("user_id")}
            />
            {errors.user_id && (
              <p className="text-xs text-red-500">{errors.user_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Peran <span className="text-red-500">*</span>
            </label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin (Dapat mengelola workspace & anggota)</SelectItem>
                    <SelectItem value="member">Member (Dapat membuat & mengelola proyek/tugas)</SelectItem>
                    <SelectItem value="viewer">Viewer (Hanya dapat melihat)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={addMemberMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={addMemberMutation.isPending}>
              {addMemberMutation.isPending ? "Menambahkan..." : "Tambah Anggota"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
