import { apiClient } from "./client";
import {
  Workspace,
  WorkspaceMember,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  AddWorkspaceMemberPayload,
  UpdateWorkspaceMemberRolePayload,
} from "@/features/workspace/types";

export const workspaceApi = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await apiClient<{ data: Workspace[] }>("/workspaces", {
      method: "GET",
    });
    return response.data;
  },

  getWorkspace: async (id: string): Promise<Workspace> => {
    const response = await apiClient<{ data: Workspace }>(`/workspaces/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  createWorkspace: async (payload: CreateWorkspacePayload): Promise<Workspace> => {
    const response = await apiClient<{ data: Workspace; message: string }>("/workspaces", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  updateWorkspace: async (
    id: string,
    payload: UpdateWorkspacePayload
  ): Promise<Workspace> => {
    const response = await apiClient<{ data: Workspace; message: string }>(
      `/workspaces/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  deleteWorkspace: async (id: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/workspaces/${id}`, {
      method: "DELETE",
    });
  },

  getMembers: async (workspaceId: string): Promise<WorkspaceMember[]> => {
    const response = await apiClient<{ data: WorkspaceMember[] }>(
      `/workspaces/${workspaceId}/members`,
      {
        method: "GET",
      }
    );
    return response.data;
  },

  addMember: async (
    workspaceId: string,
    payload: AddWorkspaceMemberPayload
  ): Promise<WorkspaceMember> => {
    const response = await apiClient<{ data: WorkspaceMember; message: string }>(
      `/workspaces/${workspaceId}/members`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  updateMemberRole: async (
    workspaceId: string,
    userId: string,
    payload: UpdateWorkspaceMemberRolePayload
  ): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(
      `/workspaces/${workspaceId}/members/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },

  removeMember: async (
    workspaceId: string,
    userId: string
  ): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(
      `/workspaces/${workspaceId}/members/${userId}`,
      {
        method: "DELETE",
      }
    );
  },
};
