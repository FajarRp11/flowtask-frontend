"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../api/project";
import {
    AddProjectMemberPayload,
    CreateProjectPayload,
    ProjectPayload,
    UpdateProjectMemberRolePayload,
} from "../types";

export function useProjects(workspaceId?: string) {
    return useQuery({
        queryKey: ["projects", workspaceId],
        queryFn: projectApi.getProjects,
        enabled: !!workspaceId,
        select: (projects) => projects.filter((project) => project.workspace.id === workspaceId),
    });
}

export function useProject(projectId?: string) {
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: () => projectApi.getProject(projectId!),
        enabled: !!projectId,
    });
}

export function useProjectMembers(projectId?: string) {
    return useQuery({
        queryKey: ["project", projectId, "members"],
        queryFn: () => projectApi.getMembers(projectId!),
        enabled: !!projectId,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateProjectPayload) => projectApi.createProject(payload),
        onSuccess: (project) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.setQueryData(["project", project.id], project);
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ProjectPayload }) =>
            projectApi.updateProject(id, payload),
        onSuccess: (project) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.setQueryData(["project", project.id], project);
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => projectApi.deleteProject(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.removeQueries({ queryKey: ["project", id] });
            queryClient.removeQueries({ queryKey: ["project", id, "members"] });
        },
    });
}

export function useAddProjectMember(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddProjectMemberPayload) => projectApi.addMember(projectId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId, "members"] });
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        },
    });
}

export function useUpdateProjectMemberRole(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, payload }: { userId: string; payload: UpdateProjectMemberRolePayload }) =>
            projectApi.updateMemberRole(projectId, userId, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId, "members"] }),
    });
}

export function useRemoveProjectMember(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => projectApi.removeMember(projectId, userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId, "members"] }),
    });
}