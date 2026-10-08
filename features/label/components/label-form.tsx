"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { useCreateLabel, useUpdateLabel } from "../hooks/use-label-queries";
import { labelSchema, LabelInput } from "../schemas";
import { Label } from "../types";

export function LabelForm({ workspaceId, label, onSuccess, onCancel }: { workspaceId: string; label?: Label; onSuccess: () => void; onCancel?: () => void }) {
  const createMutation = useCreateLabel(workspaceId);
  const updateMutation = useUpdateLabel(workspaceId);
  const mutation = label ? updateMutation : createMutation;
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<LabelInput>({
    resolver: zodResolver(labelSchema),
    defaultValues: { name: label?.name || "", color: label?.color || "#6B7280" },
  });
  useEffect(() => { reset({ name: label?.name || "", color: label?.color || "#6B7280" }); }, [label, reset]);
  const onSubmit = async (data: LabelInput) => {
    try {
      setServerError(null);
      if (label) await updateMutation.mutateAsync({ labelId: label.id, payload: data });
      else await createMutation.mutateAsync(data);
      reset(data);
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.data?.errors) {
        Object.entries(error.data.errors).forEach(([field, messages]) => { if (field in data) setError(field as keyof LabelInput, { type: "server", message: (messages as string[])[0] }); });
      } else setServerError(error instanceof ApiError ? "Unable to save label." : "An unexpected error occurred.");
    }
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">{serverError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{serverError}</div>}<div className="space-y-1.5"><label htmlFor="label-name" className="text-sm font-medium">Name</label><Input id="label-name" placeholder="Bug" {...register("name")} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}</div><div className="space-y-1.5"><label htmlFor="label-color" className="text-sm font-medium">Color</label><Input id="label-color" type="color" className="h-8 w-14 p-1" aria-label="Label color" {...register("color")} />{errors.color && <p className="text-xs text-red-500">{errors.color.message}</p>}</div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : label ? "Save changes" : "Create label"}</Button></div></form>;
}