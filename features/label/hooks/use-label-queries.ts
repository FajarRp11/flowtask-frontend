"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { labelApi } from "../api/label";
import { Label, LabelPayload } from "../types";
import { Task } from "@/features/task/types";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function useWorkspaceLabels(workspaceId?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["workspace", workspaceId, "labels"],
    queryFn: () => labelApi.getWorkspaceLabels(workspaceId!),
    enabled: isAuthenticated && !!workspaceId,
  });
}

export function useCreateLabel(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LabelPayload) => labelApi.createLabel(workspaceId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId, "labels"] }),
  });
}

export function useUpdateLabel(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ labelId, payload }: { labelId: string; payload: LabelPayload }) => labelApi.updateLabel(labelId, payload),
    onSuccess: (label) => {
      queryClient.setQueryData<Label[]>(["workspace", workspaceId, "labels"], (labels) => labels?.map((item) => item.id === label.id ? label : item));
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId, "labels"] });
    },
  });
}

export function useDeleteLabel(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => labelApi.deleteLabel(labelId),
    onSuccess: (_, labelId) => {
      queryClient.setQueryData<Label[]>(["workspace", workspaceId, "labels"], (labels) => labels?.filter((label) => label.id !== labelId));
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId, "labels"] });
    },
  });
}

export function useTaskLabels(taskId?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["task", taskId, "labels"],
    queryFn: () => labelApi.getTaskLabels(taskId!),
    enabled: isAuthenticated && !!taskId,
  });
}

function updateTaskLabelCaches(queryClient: ReturnType<typeof useQueryClient>, taskId: string, update: (labels: Label[]) => Label[]) {
  queryClient.setQueryData<Task>(["task", taskId], (task) => task ? { ...task, labels: update(task.labels || []) } : task);
  queryClient.setQueriesData<Task[]>({ queryKey: ["tasks"] }, (tasks) => tasks?.map((task) => task.id === taskId ? { ...task, labels: update(task.labels || []) } : task));
}

export function useAddTaskLabel(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => labelApi.addTaskLabel(taskId, labelId),
    onSuccess: (label) => {
      queryClient.setQueryData<Label[]>(["task", taskId, "labels"], (labels) => labels?.some((item) => item.id === label.id) ? labels : [...(labels || []), label]);
      updateTaskLabelCaches(queryClient, taskId, (labels) => labels.some((item) => item.id === label.id) ? labels : [...labels, label]);
      queryClient.invalidateQueries({ queryKey: ["task", taskId, "labels"] });
    },
  });
}

export function useRemoveTaskLabel(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => labelApi.removeTaskLabel(taskId, labelId),
    onSuccess: (_, labelId) => {
      queryClient.setQueryData<Label[]>(["task", taskId, "labels"], (labels) => labels?.filter((label) => label.id !== labelId));
      updateTaskLabelCaches(queryClient, taskId, (labels) => labels.filter((label) => label.id !== labelId));
      queryClient.invalidateQueries({ queryKey: ["task", taskId, "labels"] });
    },
  });
}