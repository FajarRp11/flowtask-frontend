import { apiClient } from "@/lib/api/client";
import {
  AddProjectMemberPayload,
  CreateProjectPayload,
  Project,
  ProjectMember,
  ProjectPayload,
  UpdateProjectMemberRolePayload,
} from "../types";

export const projectApi = {
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient<{ data: Project[] }>("/projects", {
      method: "GET",
    });
    return response.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await apiClient<{ data: Project }>(`/projects/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    const response = await apiClient<{ data: Project; message: string }>(
      "/projects",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return response.data;
  },

  updateProject: async (
    id: string,
    payload: ProjectPayload,
  ): Promise<Project> => {
    const response = await apiClient<{ data: Project; message: string }>(
      `/projects/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
    return response.data;
  },

  deleteProject: async (id: string): Promise<{ message: string }> =>
    apiClient<{ message: string }>(`/projects/${id}`, { method: "DELETE" }),

  getMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const response = await apiClient<{ data: ProjectMember[] }>(
      `/projects/${projectId}/members`,
      {
        method: "GET",
      },
    );
    return response.data;
  },

  addMember: async (
    projectId: string,
    payload: AddProjectMemberPayload,
  ): Promise<ProjectMember> => {
    const response = await apiClient<{ data: ProjectMember; message: string }>(
      `/projects/${projectId}/members`,
      { method: "POST", body: JSON.stringify(payload) },
    );
    return response.data;
  },

  updateMemberRole: async (
    projectId: string,
    userId: string,
    payload: UpdateProjectMemberRolePayload,
  ): Promise<{ message: string }> =>
    apiClient<{ message: string }>(`/projects/${projectId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  removeMember: async (
    projectId: string,
    userId: string,
  ): Promise<{ message: string }> =>
    apiClient<{ message: string }>(`/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    }),
};
