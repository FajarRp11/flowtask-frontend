"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/features/workspace/context/workspace-context";
import { useProjects } from "../hooks/use-project-queries";
import {
  projectPriorityLabels,
  projectPriorityOptions,
  projectStatusLabels,
  projectStatusOptions,
} from "../config";
import { CreateProjectDialog } from "./project-dialogs";

export function ProjectList({ workspaceId }: { workspaceId: string }) {
  const { role, selectedWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const { data: projects = [], isLoading, isError } = useProjects(workspaceId);
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const visibleProjects = projects.filter(
    (project) =>
      (status === "all" || project.status === status) &&
      (priority === "all" || project.priority === priority),
  );
  const canCreate = role === "owner" || role === "admin";

  return (
    <div className="space-y-6">
      {searchParams.get("deleted") === "1" && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          Project deleted successfully.
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {selectedWorkspace?.name || "Workspace"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize the work that matters to your team.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Create project
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 border-b pb-4">
        <Select
          value={status}
          onValueChange={(value) => setStatus(value || "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {projectStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={priority}
          onValueChange={(value) => setPriority(value || "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {projectPriorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          Failed to load projects.
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <FolderKanban className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No projects yet.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to get started.
          </p>
          {canCreate && (
            <Button className="mt-5" onClick={() => setCreateOpen(true)}>
              Create project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <Link
              key={project.id}
              href={`/workspaces/${workspaceId}/projects/${project.id}`}
              className="group rounded-xl border bg-white p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold group-hover:text-primary">
                  {project.name}
                </h2>
                <Badge variant="secondary">
                  {projectStatusLabels[project.status]}
                </Badge>
              </div>
              <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                {project.description || "No description"}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <p className="mt-1 font-medium">
                    {projectPriorityLabels[project.priority]}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Members</p>
                  <p className="mt-1 font-medium">
                    {project.members?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start date</p>
                  <p className="mt-1 font-medium">
                    {project.start_date || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due date</p>
                  <p className="mt-1 font-medium">
                    {project.due_date || "Not set"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <CreateProjectDialog
        workspaceId={workspaceId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
