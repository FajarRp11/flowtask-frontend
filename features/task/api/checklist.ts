import { apiClient } from "@/lib/api/client";
import {
  ChecklistItem,
  CreateChecklistItemPayload,
  ReorderChecklistPayload,
  UpdateChecklistItemPayload,
} from "../types/checklist";

export const checklistApi = {
  getChecklist: async (taskId: string): Promise<ChecklistItem[]> => {
    const response = await apiClient<{ data: ChecklistItem[] }>(
      `/tasks/${taskId}/checklist`,
      { method: "GET" },
    );
    return response.data;
  },

  createItem: async (
    taskId: string,
    payload: CreateChecklistItemPayload,
  ): Promise<ChecklistItem> => {
    const response = await apiClient<{
      data: ChecklistItem;
      message: string;
    }>(`/tasks/${taskId}/checklist`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  updateItem: async (
    itemId: string,
    payload: UpdateChecklistItemPayload,
  ): Promise<ChecklistItem> => {
    const response = await apiClient<{ data: ChecklistItem }>(
      `/checklist-items/${itemId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
    return response.data;
  },

  deleteItem: async (itemId: string): Promise<{ message: string }> =>
    apiClient<{ message: string }>(`/checklist-items/${itemId}`, {
      method: "DELETE",
    }),

  reorder: async (
    taskId: string,
    payload: ReorderChecklistPayload,
  ): Promise<ChecklistItem[]> => {
    const response = await apiClient<{ data: ChecklistItem[] }>(
      `/tasks/${taskId}/checklist/reorder`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
    return response.data;
  },
};
