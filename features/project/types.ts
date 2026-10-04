export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "archived";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";
export type ProjectRole = "manager" | "member";

export interface ProjectWorkspace {
    id: string;
    name: string;
    slug: string;
}

export interface ProjectMember {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: ProjectRole;
}

export interface Project {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date?: string | null;
    due_date?: string | null;
    workspace: ProjectWorkspace;
    members?: ProjectMember[];
}

export interface ProjectPayload {
    name: string;
    description?: string | null;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    start_date?: string | null;
    due_date?: string | null;
}

export interface CreateProjectPayload extends ProjectPayload {
    workspace_id: string;
}

export interface AddProjectMemberPayload {
    user_id: string;
    role: ProjectRole;
}

export interface UpdateProjectMemberRolePayload {
    role: ProjectRole;
}