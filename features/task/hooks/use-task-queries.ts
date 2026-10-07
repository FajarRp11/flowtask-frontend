"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/task";
import { CreateTaskPayload, TaskPayload } from "../types";

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskApi.getTasks(projectId!),
    enabled: !!projectId,
  });
}

export function useTask(taskId?: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => taskApi.getTask(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      taskApi.createTask(projectId, payload),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.setQueryData(["task", task.id], task);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: TaskPayload;
    }) => taskApi.updateTask(taskId, payload),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", task.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskApi.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["task", taskId] });
    },
  });
}

export function useTaskAssignees(taskId?: string) {
  return useQuery({
    queryKey: ["task", taskId, "assignees"],
    queryFn: () => taskApi.getAssignees(taskId!),
    enabled: !!taskId,
  });
}

export function useAddTaskAssignee(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => taskApi.addAssignee(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId, "assignees"] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useRemoveTaskAssignee(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => taskApi.removeAssignee(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId, "assignees"] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
