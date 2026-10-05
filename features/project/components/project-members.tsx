"use client";

import { useState } from "react";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceMembers } from "@/features/workspace/hooks/use-workspace-queries";
import { ApiError } from "@/lib/api/client";
import { projectRoleLabels, projectRoleOptions } from "../config";
import {
  useAddProjectMember,
  useProjectMembers,
  useRemoveProjectMember,
  useUpdateProjectMemberRole,
} from "../hooks/use-project-queries";
import { AddProjectMemberInput, addProjectMemberSchema } from "../schemas";
import { ProjectMember } from "../types";

export function ProjectMembers({
  projectId,
  workspaceId,
  canManage,
}: {
  projectId: string;
  workspaceId: string;
  canManage: boolean;
}) {
  const {
    data: members = [],
    isLoading,
    isError,
  } = useProjectMembers(projectId);
  const { data: workspaceMembers = [] } = useWorkspaceMembers(workspaceId);
  const addMutation = useAddProjectMember(projectId);
  const roleMutation = useUpdateProjectMemberRole(projectId);
  const removeMutation = useRemoveProjectMember(projectId);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] =
    useState<AddProjectMemberInput["role"]>("member");
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const availableMembers = workspaceMembers.filter(
    (member) =>
      !members.some((projectMember) => projectMember.id === member.id),
  );
  const handleAdd = async () => {
    const result = addProjectMemberSchema.safeParse({
      user_id: selectedUser,
      role: selectedRole,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Select a member.");
      return;
    }
    try {
      setError(null);
      await addMutation.mutateAsync(result.data);
      setSelectedUser("");
      setSelectedRole("member");
      setAddOpen(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to add project member.",
      );
    }
  };
  const handleRemove = async () => {
    if (!memberToRemove) return;
    try {
      setError(null);
      await removeMutation.mutateAsync(memberToRemove.id);
      setMemberToRemove(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to remove project member.",
      );
    }
  };
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Members</h2>
          <p className="text-sm text-muted-foreground">
            People assigned to this project.
          </p>
        </div>
        {canManage && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="size-4" />
            Add member
          </Button>
        )}
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          Failed to load members.
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No project members
        </div>
      ) : (
        <div className="divide-y rounded-xl border bg-white dark:bg-zinc-900">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-4">
              <Avatar className="size-9">
                <AvatarFallback>
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <Badge variant="secondary">
                {projectRoleLabels[member.role]}
              </Badge>
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={
                        roleMutation.isPending || member.role === "manager"
                      }
                      onClick={() =>
                        roleMutation.mutate({
                          userId: member.id,
                          payload: { role: "manager" },
                        })
                      }
                    >
                      Make manager
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        roleMutation.isPending || member.role === "member"
                      }
                      onClick={() =>
                        roleMutation.mutate({
                          userId: member.id,
                          payload: { role: "member" },
                        })
                      }
                    >
                      Make member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setMemberToRemove(member)}
                    >
                      Remove member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add project member</DialogTitle>
            <DialogDescription>
              Choose from people already in this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">User</label>
              <Select
                value={selectedUser}
                onValueChange={(value) => setSelectedUser(value || "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a workspace member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Project role</label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(
                    (value || "member") as AddProjectMemberInput["role"],
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectRoleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleAdd()}
              disabled={addMutation.isPending || availableMembers.length === 0}
            >
              {addMutation.isPending ? "Adding..." : "Add member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove project member?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.name} will lose access to this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleRemove();
              }}
              disabled={removeMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {removeMutation.isPending ? "Removing..." : "Remove member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
