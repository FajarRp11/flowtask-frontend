import { apiClient } from "@/lib/api/client";
import { Label, LabelPayload } from "../types";

export const labelApi = {
  getWorkspaceLabels: async (workspaceId: string): Promise<Label[]> => {
    const response = await apiClient<{ data: Label[] }>(`/workspaces/${workspaceId}/labels`, { method: "GET" });
    return response.data;
  },

  createLabel: async (workspaceId: string, payload: LabelPayload): Promise<Label> => {
    const response = await apiClient<{ data: Label; message: string }>(`/workspaces/${workspaceId}/labels`, { method: "POST", body: JSON.stringify(payload) });
    return response.data;
  },

  updateLabel: async (labelId: string, payload: LabelPayload): Promise<Label> => {
    const response = await apiClient<{ data: Label; message?: string }>(`/labels/${labelId}`, { method: "PATCH", body: JSON.stringify(payload) });
    return response.data;
  },

  deleteLabel: async (labelId: string): Promise<{ message: string }> =>
    apiClient<{ message: string }>(`/labels/${labelId}`, { method: "DELETE" }),

  getTaskLabels: async (taskId: string): Promise<Label[]> => {
    const response = await apiClient<{ data: Label[] }>(`/tasks/${taskId}/labels`, { method: "GET" });
    return response.data;
  },

  addTaskLabel: async (taskId: string, labelId: string): Promise<Label> => {
    const response = await apiClient<{ data: Label; message: string }>(`/tasks/${taskId}/labels`, { method: "POST", body: JSON.stringify({ label_id: labelId }) });
    return response.data;
  },

  removeTaskLabel: async (taskId: string, labelId: string): Promise<{ message: string }> =>
    apiClient<{ message: string }>(`/tasks/${taskId}/labels/${labelId}`, { method: "DELETE" }),
};