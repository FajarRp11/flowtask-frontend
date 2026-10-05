import { apiClient } from "@/lib/api/client";
import { CreateTaskPayload, Task, TaskPayload } from "../types";

export const taskApi = {
  getTasks: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient<{ data: Task[] }>(
      `/projects/${projectId}/tasks`,
      { method: "GET" },
    );
    return response.data;
  },

  getTask: async (taskId: string): Promise<Task> => {
    const response = await apiClient<{ data: Task }>(`/tasks/${taskId}`, {
      method: "GET",
    });
    return response.data;
  },

  createTask: async (
    projectId: string,
    payload: CreateTaskPayload,
  ): Promise<Task> => {
    const response = await apiClient<{ data: Task; message: string }>(
      `/projects/${projectId}/tasks`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return response.data;
  },

  updateTask: async (taskId: string, payload: TaskPayload): Promise<Task> => {
    const response = await apiClient<{ data: Task; message: string }>(
      `/tasks/${taskId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<{ message: string }> =>
    apiClient<{ message: string }>(`/tasks/${taskId}`, { method: "DELETE" }),
};
