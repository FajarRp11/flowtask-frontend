"use client";

import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import type { DragEndEvent } from "@dnd-kit/react";
import { ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import {
  useTaskChecklist,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
  useReorderChecklist,
} from "../hooks/use-checklist-queries";
import { ChecklistItem as ChecklistItemType } from "../types/checklist";
import { ChecklistItem } from "./checklist-item";
import { ChecklistForm } from "./checklist-form";
import { ChecklistProgress } from "./checklist-progress";

export function TaskChecklist({
  taskId,
  canManage,
}: {
  taskId: string;
  canManage: boolean;
}) {
  const { data: items = [], isLoading, isError } = useTaskChecklist(taskId);
  const createMutation = useCreateChecklistItem(taskId);
  const updateMutation = useUpdateChecklistItem(taskId);
  const deleteMutation = useDeleteChecklistItem(taskId);
  const reorderMutation = useReorderChecklist(taskId);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (data: { title: string }) => {
    try {
      setError(null);
      await createMutation.mutateAsync(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Failed to create checklist item.",
      );
    }
  };

  const handleToggle = (item: ChecklistItemType) => {
    setError(null);
    updateMutation.mutate(
      {
        itemId: item.id,
        payload: { title: item.title, is_completed: !item.is_completed },
      },
      {
        onError: (caughtError) => {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Failed to update checklist item.",
          );
        },
      },
    );
  };

  const handleUpdateTitle = (item: ChecklistItemType, title: string) => {
    setError(null);
    updateMutation.mutate(
      {
        itemId: item.id,
        payload: { title, is_completed: item.is_completed },
      },
      {
        onError: (caughtError) => {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Failed to update checklist item.",
          );
        },
      },
    );
  };

  const handleDelete = (item: ChecklistItemType) => {
    setError(null);
    deleteMutation.mutate(item.id, {
      onError: (caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Failed to delete checklist item.",
        );
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled || !canManage) return;

    const sourceId = event.operation.source?.id
      ? String(event.operation.source.id).replace("checklist:", "")
      : "";
    const targetId = event.operation.target?.id
      ? String(event.operation.target.id).replace("checklist-drop:", "")
      : "";

    if (!sourceId || !targetId || sourceId === targetId) return;

    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const reordered = [...items];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = {
      items: reordered.map((item, index) => ({
        id: item.id,
        sort_order: index,
      })),
    };

    setError(null);
    reorderMutation.mutate(payload, {
      onError: (caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Failed to reorder checklist.",
        );
      },
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ClipboardList className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Checklist</h2>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load checklist.
        </p>
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : (
        <>
          <ChecklistProgress items={items} />

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No checklist items yet.
            </p>
          ) : (
            <DragDropProvider onDragEnd={handleDragEnd}>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    canManage={canManage}
                    onToggle={handleToggle}
                    onUpdateTitle={handleUpdateTitle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </DragDropProvider>
          )}

          {canManage && (
            <ChecklistForm
              onSubmit={handleCreate}
              isPending={createMutation.isPending}
            />
          )}
        </>
      )}
    </section>
  );
}
