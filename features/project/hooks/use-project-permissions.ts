import { ProjectRole } from "../types";
import { WorkspaceRole } from "@/features/workspace/types";

export function isProjectManager(projectRole?: ProjectRole | null) {
  return projectRole === "manager";
}

export function canManageProject(
  workspaceRole?: WorkspaceRole | null,
  projectRole?: ProjectRole | null,
) {
  return (
    workspaceRole === "owner" ||
    workspaceRole === "admin" ||
    isProjectManager(projectRole)
  );
}

export const canManageProjectMembers = canManageProject;
export const canDeleteProject = canManageProject;
