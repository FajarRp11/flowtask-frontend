"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "@/lib/api/workspace";
import {
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  AddWorkspaceMemberPayload,
  UpdateWorkspaceMemberRolePayload,
} from "../types";

export function useWorkspaceDetail(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceApi.getWorkspace(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceMembers(workspaceId?: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId, "members"],
    queryFn: () => workspaceApi.getMembers(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) =>
      workspaceApi.createWorkspace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateWorkspacePayload;
    }) => workspaceApi.updateWorkspace(id, payload),
    onSuccess: (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", updatedWorkspace.id],
      });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspaceApi.deleteWorkspace(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.removeQueries({ queryKey: ["workspace", id] });
    },
  });
}

export function useAddWorkspaceMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddWorkspaceMemberPayload) =>
      workspaceApi.addMember(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
    },
  });
}

export function useUpdateWorkspaceMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateWorkspaceMemberRolePayload;
    }) => workspaceApi.updateMemberRole(workspaceId, userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
    },
  });
}

export function useRemoveWorkspaceMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      workspaceApi.removeMember(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
    },
  });
}
