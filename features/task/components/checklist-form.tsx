"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checklistItemSchema, ChecklistItemInput } from "../schemas/checklist";

export function ChecklistForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: ChecklistItemInput) => Promise<void>;
  isPending: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChecklistItemInput>({
    resolver: zodResolver(checklistItemSchema),
    defaultValues: { title: "" },
  });

  const submit = async (data: ChecklistItemInput) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex items-start gap-2"
    >
      <div className="min-w-0 flex-1">
        <Input
          {...register("title")}
          placeholder="Add a checklist item..."
          aria-label="New checklist item title"
          aria-invalid={!!errors.title}
          disabled={isPending}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-destructive">
            {errors.title.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Plus className="size-3.5" />
        )}
        Add
      </Button>
    </form>
  );
}
