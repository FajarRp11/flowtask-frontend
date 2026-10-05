import { canManageProject } from "@/features/project/hooks/use-project-permissions";
import { ProjectRole } from "@/features/project/types";
import { WorkspaceRole } from "@/features/workspace/types";

export function canManageTask(
    workspaceRole?: WorkspaceRole | null,
    projectRole?: ProjectRole | null,
) {
    return canManageProject(workspaceRole, projectRole);
}