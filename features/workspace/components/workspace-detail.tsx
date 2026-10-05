"use client";

import { useEffect, useState } from "react";
import { Settings, Users, FolderKanban, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceDetail } from "../hooks/use-workspace-queries";
import { useWorkspace } from "../context/workspace-context";
import { WorkspaceMembers } from "./workspace-members";
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog";
import { WorkspaceRole } from "../types";
import { CreateProjectDialog } from "@/features/project/components/project-dialogs";
import { useProjects } from "@/features/project/hooks/use-project-queries";
import {
  projectPriorityLabels,
  projectStatusLabels,
} from "@/features/project/config";
import Link from "next/link";

interface WorkspaceDetailProps {
  workspaceId: string;
}

const roleBadgeLabel: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export function WorkspaceDetail({ workspaceId }: WorkspaceDetailProps) {
  const {
    data: workspace,
    isLoading,
    isError,
    error,
  } = useWorkspaceDetail(workspaceId);
  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects(workspaceId);
  const { role, canManageWorkspace, setSelectedWorkspaceId } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"projects" | "members">(
    "projects",
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  useEffect(() => {
    setSelectedWorkspaceId(workspaceId);
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        <h3 className="text-lg font-semibold">Gagal Memuat Workspace</h3>
        <p className="mt-1 text-sm">
          {error instanceof Error
            ? error.message
            : "Workspace tidak ditemukan atau terjadi kesalahan."}
        </p>
      </div>
    );
  }

  const memberCount = workspace.members?.length || 0;

  return (
    <div className="space-y-6">
      {/* Workspace Header Info */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {workspace.name}
            </h1>
            {role && (
              <Badge variant="secondary" className="capitalize">
                Peran Anda: {roleBadgeLabel[role] || role}
              </Badge>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {workspace.description || "Belum ada deskripsi workspace."}
          </p>
          <div className="flex items-center gap-4 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {memberCount} Anggota
            </span>
            <span>•</span>
            <span>Pemilik: {workspace.owner?.name || "N/A"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManageWorkspace && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="gap-2"
            >
              <Settings className="size-4" />
              <span>Pengaturan Workspace</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition ${
              activeTab === "projects"
                ? "border-primary text-primary"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            <FolderKanban className="size-4" />
            <span>Proyek</span>
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition ${
              activeTab === "members"
                ? "border-primary text-primary"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            <Users className="size-4" />
            <span>Anggota ({memberCount})</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Proyek Workspace
            </h3>
            <div className="flex items-center gap-2">
              {canManageWorkspace && (
                <Button
                  onClick={() => setCreateProjectOpen(true)}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  <span>Create project</span>
                </Button>
              )}
              <Button
                nativeButton={false}
                render={<Link href={`/workspaces/${workspaceId}/projects`} />}
                variant="outline"
                className="gap-2"
              >
                <FolderKanban className="size-4" />
                <span>Lihat Proyek</span>
              </Button>
            </div>
          </div>

          {projectsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : projectsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              Gagal memuat daftar proyek.
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <FolderKanban className="size-6" />
              </div>
              <h4 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Belum ada proyek
              </h4>
              <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                Buat proyek pertama Anda untuk memulai.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/workspaces/${workspaceId}/projects/${project.id}`}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {project.name}
                    </h4>
                    <Badge variant="secondary">
                      {projectStatusLabels[project.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-zinc-500 dark:text-zinc-400">
                    {project.description || "Tidak ada deskripsi"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      Prioritas: {projectPriorityLabels[project.priority]}
                    </span>
                    <span>Anggota: {project.members?.length || 0}</span>
                    {project.due_date && (
                      <span>Deadline: {project.due_date}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <WorkspaceMembers workspaceId={workspaceId} />
      )}

      {/* Settings Dialog */}
      {workspace && (
        <WorkspaceSettingsDialog
          workspace={workspace}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      )}

      <CreateProjectDialog
        workspaceId={workspaceId}
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </div>
  );
}
