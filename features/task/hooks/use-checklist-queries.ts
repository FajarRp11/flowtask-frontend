"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checklistApi } from "../api/checklist";
import {
  ChecklistItem,
  CreateChecklistItemPayload,
  ReorderChecklistPayload,
  UpdateChecklistItemPayload,
} from "../types/checklist";

export function useTaskChecklist(taskId?: string) {
  return useQuery({
    queryKey: ["task", taskId, "checklist"],
    queryFn: () => checklistApi.getChecklist(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChecklistItemPayload) =>
      checklistApi.createItem(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["task", taskId, "checklist"],
      });
    },
  });
}

export function useUpdateChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateChecklistItemPayload;
    }) => checklistApi.updateItem(itemId, payload),
    onMutate: async ({ itemId, payload }) => {
      await queryClient.cancelQueries({
        queryKey: ["task", taskId, "checklist"],
      });
      const previous = queryClient.getQueryData<ChecklistItem[]>([
        "task",
        taskId,
        "checklist",
      ]);
      queryClient.setQueryData<ChecklistItem[]>(
        ["task", taskId, "checklist"],
        (items) =>
          items?.map((item) =>
            item.id === itemId ? { ...item, ...payload } : item,
          ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["task", taskId, "checklist"],
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["task", taskId, "checklist"],
      });
    },
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => checklistApi.deleteItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({
        queryKey: ["task", taskId, "checklist"],
      });
      const previous = queryClient.getQueryData<ChecklistItem[]>([
        "task",
        taskId,
        "checklist",
      ]);
      queryClient.setQueryData<ChecklistItem[]>(
        ["task", taskId, "checklist"],
        (items) => items?.filter((item) => item.id !== itemId),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["task", taskId, "checklist"],
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["task", taskId, "checklist"],
      });
    },
  });
}

export function useReorderChecklist(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReorderChecklistPayload) =>
      checklistApi.reorder(taskId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ["task", taskId, "checklist"],
      });
      const previous = queryClient.getQueryData<ChecklistItem[]>([
        "task",
        taskId,
        "checklist",
      ]);
      queryClient.setQueryData<ChecklistItem[]>(
        ["task", taskId, "checklist"],
        (items) => {
          if (!items) return items;
          const orderMap = new Map(
            payload.items.map((entry) => [entry.id, entry.sort_order]),
          );
          return [...items].sort(
            (a, b) =>
              (orderMap.get(a.id) ?? a.sort_order) -
              (orderMap.get(b.id) ?? b.sort_order),
          );
        },
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["task", taskId, "checklist"],
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["task", taskId, "checklist"],
      });
    },
  });
}
