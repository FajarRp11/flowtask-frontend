"use client";

import Link from "next/link";
import { CalendarDays, GripVertical } from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { taskPriorityLabels } from "../config";
import { Task } from "../types";

export function TaskCard({
  task,
  workspaceId,
  projectId,
}: {
  task: Task;
  workspaceId: string;
  projectId: string;
}) {
  const { ref: draggableRef, isDragging } = useDraggable({
    id: task.id,
    data: { taskId: task.id, status: task.status },
  });
  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: `task-drop:${task.id}`,
    data: { taskId: task.id, status: task.status },
  });
  const assignee = task.assignees?.[0];
  return (
    <div
      ref={droppableRef}
      className={isDropTarget ? "rounded-lg ring-2 ring-primary/40" : ""}
    >
      <div ref={draggableRef} className={isDragging ? "opacity-40" : ""}>
        <Link
          href={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`}
          className="block rounded-lg border bg-white p-3 shadow-xs transition hover:border-primary/50 hover:shadow-sm dark:bg-zinc-900"
        >
          <div className="flex items-start gap-2">
            <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <h4 className="min-w-0 flex-1 text-sm font-medium">{task.title}</h4>
            <Badge variant="outline" className="shrink-0">
              {taskPriorityLabels[task.priority]}
            </Badge>
          </div>
          {task.due_date && (
            <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {task.due_date}
            </p>
          )}
          {assignee && (
            <div className="mt-3 flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={assignee.avatar || undefined} />
                <AvatarFallback>
                  {assignee.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs text-muted-foreground">
                {assignee.name}
              </span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
