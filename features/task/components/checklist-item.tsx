"use client";

import { useState, useRef, useEffect } from "react";
import {
  Check,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChecklistItem as ChecklistItemType } from "../types/checklist";

export function ChecklistItem({
  item,
  canManage,
  onToggle,
  onUpdateTitle,
  onDelete,
}: {
  item: ChecklistItemType;
  canManage: boolean;
  onToggle: (item: ChecklistItemType) => void;
  onUpdateTitle: (item: ChecklistItemType, title: string) => void;
  onDelete: (item: ChecklistItemType) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { ref: draggableRef, handleRef, isDragging } = useDraggable({
    id: `checklist:${item.id}`,
    data: { checklistItemId: item.id },
    disabled: !canManage,
  });

  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: `checklist-drop:${item.id}`,
    data: { checklistItemId: item.id },
    disabled: !canManage,
  });

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = () => {
    setEditValue(item.title);
    setEditing(true);
  };

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.title) {
      onUpdateTitle(item, trimmed);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(item.title);
    setEditing(false);
  };

  return (
    <>
      <div
        ref={droppableRef}
        className={isDropTarget ? "rounded-lg ring-2 ring-primary/40" : ""}
      >
        <div
          ref={draggableRef}
          className={`group flex items-center gap-2 rounded-lg border bg-white px-2 py-1.5 transition dark:bg-zinc-900 ${
            isDragging ? "opacity-40" : ""
          } ${item.is_completed ? "border-muted bg-muted/30 dark:bg-muted/10" : ""}`}
        >
          {canManage && (
            <button
              ref={handleRef}
              type="button"
              aria-label={`Drag ${item.title}`}
              className="cursor-grab touch-none text-muted-foreground opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>
          )}

          <button
            type="button"
            role="checkbox"
            aria-checked={item.is_completed}
            aria-label={
              item.is_completed
                ? `Uncheck ${item.title}`
                : `Check ${item.title}`
            }
            onClick={() => onToggle(item)}
            disabled={!canManage}
            className={`flex size-5 shrink-0 items-center justify-center rounded border transition ${
              item.is_completed
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:border-primary/50"
            } ${!canManage ? "cursor-default" : "cursor-pointer"}`}
          >
            {item.is_completed && <Check className="size-3.5" />}
          </button>

          {editing ? (
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveEdit();
                  }
                  if (event.key === "Escape") cancelEdit();
                }}
                className="h-7 text-sm"
                aria-label="Edit checklist item title"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={saveEdit}
                aria-label="Save title"
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={cancelEdit}
                aria-label="Cancel editing"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                item.is_completed
                  ? "text-muted-foreground line-through"
                  : ""
              }`}
              onDoubleClick={() => canManage && startEdit()}
            >
              {item.title}
            </span>
          )}

          {canManage && !editing && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Actions for ${item.title}`}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                }
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom">
                <DropdownMenuItem onClick={startEdit}>
                  <Pencil className="size-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{item.title}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This checklist item will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                onDelete(item);
                setDeleteOpen(false);
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
