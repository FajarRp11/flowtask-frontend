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
    index?: number;
}) {
    const { ref: draggableRef, handleRef, isDragging } = useDraggable({
        id: task.id,
        data: { taskId: task.id, status: task.status },
    });
    const { ref: droppableRef, isDropTarget } = useDroppable({
        id: `task-drop:${task.id}`,
        data: { taskId: task.id, status: task.status },
    });
    const assignees = task.assignees || [];
    return (
        <div ref={droppableRef} className={isDropTarget ? "rounded-lg ring-2 ring-primary/40" : ""}>
            <div ref={draggableRef} className={isDragging ? "opacity-40" : ""}>
                <div className="rounded-lg border bg-white p-3 shadow-xs transition hover:border-primary/50 dark:bg-zinc-900">
                    <div className="flex items-start gap-2">
                        <button ref={handleRef} type="button" aria-label={`Drag ${task.title}`} className="mt-0.5 cursor-grab touch-none text-muted-foreground active:cursor-grabbing">
                            <GripVertical className="size-4" />
                        </button>
                        <Link href={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`} className="min-w-0 flex-1 text-sm font-medium hover:text-primary">
                            {task.title}
                        </Link>
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
                    {assignees.length > 0 && (
                        <div className="mt-3 flex items-center -space-x-1">
                            {assignees.slice(0, 3).map((assignee) => (
                                <Avatar key={assignee.id} className="size-6 border-2 border-white dark:border-zinc-900" aria-label={assignee.name}>
                                    <AvatarImage src={assignee.avatar || undefined} />
                                    <AvatarFallback>{assignee.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            ))}
                            {assignees.length > 3 && <span className="ml-2 text-xs text-muted-foreground">+{assignees.length - 3}</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
