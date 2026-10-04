"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { workspaceApi } from "@/lib/api/workspace";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Workspace, WorkspaceRole } from "../types";

const WORKSPACE_STORAGE_KEY = "flowtask_selected_workspace_id";

interface WorkspaceContextType {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  selectedWorkspaceId: string | null;
  setSelectedWorkspaceId: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  role: WorkspaceRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  canManageWorkspace: boolean;
  canManageMembers: boolean;
  canDeleteWorkspace: boolean;
  refetchWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [selectedWorkspaceId, setSelectedWorkspaceIdState] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (savedId) {
        setSelectedWorkspaceIdState(savedId);
      }
    }
  }, []);

  const setSelectedWorkspaceId = (id: string) => {
    setSelectedWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
    }
  };

  const {
    data: workspaces = [],
    isLoading,
    isError,
    error,
    refetch: refetchWorkspaces,
  } = useQuery({
    queryKey: ["workspaces"],
    queryFn: workspaceApi.getWorkspaces,
    enabled: isAuthenticated,
  });

  const selectedWorkspace = useMemo(() => {
    if (!workspaces.length) return null;
    if (selectedWorkspaceId) {
      const found = workspaces.find((w) => w.id === selectedWorkspaceId);
      if (found) return found;
    }
    return workspaces[0];
  }, [workspaces, selectedWorkspaceId]);

  const selectedWorkspaceSummary = selectedWorkspace;
  const { data: selectedWorkspaceDetail } = useQuery({
    queryKey: ["workspace", selectedWorkspaceSummary?.id],
    queryFn: () => workspaceApi.getWorkspace(selectedWorkspaceSummary!.id),
    enabled: isAuthenticated && !!selectedWorkspaceSummary?.id,
  });

  const workspaceForPermissions = selectedWorkspaceDetail || selectedWorkspaceSummary;

  useEffect(() => {
    if (selectedWorkspace && selectedWorkspace.id !== selectedWorkspaceId) {
      setSelectedWorkspaceIdState(selectedWorkspace.id);
    }
  }, [selectedWorkspace, selectedWorkspaceId]);

  const role = useMemo<WorkspaceRole | null>(() => {
    if (!workspaceForPermissions || !user) return null;

    // Check if user is owner object
    if (
      workspaceForPermissions.owner?.id === user.id ||
      workspaceForPermissions.owner?.email === user.email
    ) {
      return "owner";
    }

    // Check members list
    if (workspaceForPermissions.members) {
      const member = workspaceForPermissions.members.find(
        (m) => String(m.id) === String(user.id) || m.email === user.email
      );
      if (member) return member.role;
    }

    return null;
  }, [workspaceForPermissions, user]);

  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const canManageWorkspace = isOwner || isAdmin;
  const canManageMembers = isOwner || isAdmin;
  const canDeleteWorkspace = isOwner;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        selectedWorkspace,
        selectedWorkspaceId: selectedWorkspace?.id || null,
        setSelectedWorkspaceId,
        isLoading,
        isError,
        error: error as Error | null,
        role,
        isOwner,
        isAdmin,
        canManageWorkspace,
        canManageMembers,
        canDeleteWorkspace,
        refetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
