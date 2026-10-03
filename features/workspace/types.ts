export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface WorkspaceOwner {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: WorkspaceRole;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  owner?: WorkspaceOwner;
  members?: WorkspaceMember[];
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string | null;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string | null;
}

export interface AddWorkspaceMemberPayload {
  user_id: string;
  role: Exclude<WorkspaceRole, "owner">;
}

export interface UpdateWorkspaceMemberRolePayload {
  role: Exclude<WorkspaceRole, "owner">;
}
