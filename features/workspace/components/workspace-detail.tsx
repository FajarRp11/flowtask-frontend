"use client";

import { useState } from "react";
import { Settings, Users, FolderKanban, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceDetail } from "../hooks/use-workspace-queries";
import { useWorkspace } from "../context/workspace-context";
import { WorkspaceMembers } from "./workspace-members";
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog";
import { WorkspaceRole } from "../types";

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
  const { data: workspace, isLoading, isError, error } = useWorkspaceDetail(workspaceId);
  const { role, canManageWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"projects" | "members">("projects");
  const [settingsOpen, setSettingsOpen] = useState(false);

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
          {error instanceof Error ? error.message : "Workspace tidak ditemukan atau terjadi kesalahan."}
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
            <Button disabled className="gap-2 opacity-60 cursor-not-allowed">
              <Plus className="size-4" />
              <span>Proyek Baru (Segera Hadir)</span>
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <FolderKanban className="size-6" />
            </div>
            <h4 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Belum ada proyek
            </h4>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Fitur manajemen proyek di dalam workspace ini akan tersedia pada tahap selanjutnya.
            </p>
          </div>
        </div>
      )}

      {activeTab === "members" && <WorkspaceMembers workspaceId={workspaceId} />}

      {/* Settings Dialog */}
      {workspace && (
        <WorkspaceSettingsDialog
          workspace={workspace}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      )}
    </div>
  );
}
