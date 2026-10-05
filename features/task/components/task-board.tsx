"use client";

import { useMemo, useState } from "react";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import type { DragEndEvent } from "@dnd-kit/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import {
  taskPriorityOptions,
  taskStatusLabels,
  taskStatusOptions,
} from "../config";
import { useTasks, useUpdateTask } from "../hooks/use-task-queries";
import { Task, TaskPriority, TaskStatus } from "../types";
import { CreateTaskDialog } from "./task-dialogs";
import { TaskCard } from "./task-card";

function TaskColumn({
  status,
  tasks,
  workspaceId,
  projectId,
}: {
  status: TaskStatus;
  tasks: Task[];
  workspaceId: string;
  projectId: string;
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `column:${status}`,
    data: { status },
  });
  return (
    <div
      ref={ref}
      data-status={status}
      className={`min-w-70 flex-1 rounded-xl bg-zinc-100/80 p-3 dark:bg-zinc-900/70 ${isDropTarget ? "ring-2 ring-primary/40" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{taskStatusLabels[status]}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-muted-foreground dark:bg-zinc-800">
          {tasks.length}
        </span>
      </div>
      <div className="min-h-32 space-y-3">
        {tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed p-5 text-center text-xs text-muted-foreground">
            No tasks in this column
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              workspaceId={workspaceId}
              projectId={projectId}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function TaskBoard({
  projectId,
  workspaceId,
  canManage,
}: {
  projectId: string;
  workspaceId: string;
  canManage: boolean;
}) {
  const { data: tasks = [], isLoading, isError } = useTasks(projectId);
  const updateMutation = useUpdateTask();
  const [taskOverrides, setTaskOverrides] = useState<Record<string, Task>>({});
  const [taskOrder, setTaskOrder] = useState<
    Partial<Record<TaskStatus, string[]>>
  >({});
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all",
  );
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);

  const assignees = useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>();
    tasks.forEach((task) =>
      task.assignees?.forEach((assignee) =>
        unique.set(assignee.id, { id: assignee.id, name: assignee.name }),
      ),
    );
    return [...unique.values()];
  }, [tasks]);
  const boardTasks = useMemo(() => {
    const mergedTasks = tasks.map((task) => taskOverrides[task.id] || task);
    return taskStatusOptions.flatMap((option) => {
      const columnTasks = mergedTasks.filter(
        (task) => task.status === option.value,
      );
      const order = taskOrder[option.value] || [];
      return [
        ...order
          .map((id) => columnTasks.find((task) => task.id === id))
          .filter((task): task is Task => !!task),
        ...columnTasks.filter((task) => !order.includes(task.id)),
      ];
    });
  }, [taskOrder, taskOverrides, tasks]);
  const visibleTasks = boardTasks.filter(
    (task) =>
      (priorityFilter === "all" || task.priority === priorityFilter) &&
      (assigneeFilter === "all" ||
        task.assignees?.some((assignee) => assignee.id === assigneeFilter)),
  );
  const moveTask = async (
    task: Task,
    status: TaskStatus,
    targetTaskId?: string,
  ) => {
    const previousOverrides = taskOverrides;
    const previousOrder = taskOrder;
    const nextOverrides =
      status === task.status
        ? taskOverrides
        : { ...taskOverrides, [task.id]: { ...task, status } };
    const nextColumn = [
      ...(
        taskOrder[status] ||
        boardTasks
          .filter((item) => item.status === status)
          .map((item) => item.id)
      ).filter((id) => id !== task.id),
    ];
    const targetIndex = targetTaskId ? nextColumn.indexOf(targetTaskId) : -1;
    nextColumn.splice(
      targetIndex >= 0 ? targetIndex : nextColumn.length,
      0,
      task.id,
    );
    setTaskOverrides(nextOverrides);
    setTaskOrder({
      ...taskOrder,
      [task.status]: (taskOrder[task.status] || []).filter(
        (id) => id !== task.id,
      ),
      [status]: nextColumn,
    });
    if (status === task.status) return;
    try {
      setMoveError(null);
      await updateMutation.mutateAsync({
        taskId: task.id,
        payload: { status },
      });
    } catch (error) {
      setTaskOverrides(previousOverrides);
      setTaskOrder(previousOrder);
      setMoveError(
        error instanceof ApiError ? error.message : "Failed to move task.",
      );
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled || !canManage) return;
    const sourceId = event.operation.source?.id
      ? String(event.operation.source.id)
      : "";
    const targetId = event.operation.target?.id
      ? String(event.operation.target.id)
      : "";
    const task = boardTasks.find((item) => item.id === sourceId);
    if (!task || !targetId) return;
    const targetTaskId = targetId.startsWith("task-drop:")
      ? targetId.slice(10)
      : undefined;
    const targetTask = targetTaskId
      ? boardTasks.find((item) => item.id === targetTaskId)
      : undefined;
    const targetStatus = targetId.startsWith("column:")
      ? (targetId.slice(7) as TaskStatus)
      : targetTask?.status;
    if (!targetStatus) return;
    void moveTask(task, targetStatus, targetTaskId);
  };

  if (isLoading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="grid min-w-max gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-64 w-72" />
          <Skeleton className="h-64 w-72" />
          <Skeleton className="h-64 w-72" />
          <Skeleton className="h-64 w-72" />
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        Failed to load tasks.
      </div>
    );
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Plan and track work in this project.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>Create task</Button>
        )}
      </div>
      {moveError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {moveError}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Select
          value={priorityFilter}
          onValueChange={(value) =>
            setPriorityFilter((value || "all") as TaskPriority | "all")
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {taskPriorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={assigneeFilter}
          onValueChange={(value) => setAssigneeFilter(value || "all")}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {assignees.map((assignee) => (
              <SelectItem key={assignee.id} value={assignee.id}>
                {assignee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex min-w-0 gap-4 overflow-x-auto pb-3">
          {taskStatusOptions.map((option) => (
            <TaskColumn
              key={option.value}
              status={option.value}
              tasks={visibleTasks.filter(
                (task) => task.status === option.value,
              )}
              workspaceId={workspaceId}
              projectId={projectId}
            />
          ))}
        </div>
      </DragDropProvider>
      <CreateTaskDialog
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </section>
  );
}
