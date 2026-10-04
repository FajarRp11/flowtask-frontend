"use client";

import { useState } from "react";
import { UserPlus, MoreHorizontal, Shield, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";

import { WorkspaceMember, WorkspaceRole } from "../types";
import { useWorkspace } from "../context/workspace-context";
import {
  useWorkspaceMembers,
  useUpdateWorkspaceMemberRole,
  useRemoveWorkspaceMember,
} from "../hooks/use-workspace-queries";
import { InviteMemberDialog } from "./invite-member-dialog";
import { ApiError } from "@/lib/api/client";

interface WorkspaceMembersProps {
  workspaceId: string;
}

const roleBadgeVariant: Record<
  WorkspaceRole,
  "default" | "secondary" | "outline" | "destructive"
> = {
  owner: "default",
  admin: "secondary",
  member: "outline",
  viewer: "outline",
};

const roleLabel: Record<WorkspaceRole, string> = {
  owner: "Pemilik (Owner)",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export function WorkspaceMembers({ workspaceId }: WorkspaceMembersProps) {
  const { canManageMembers } = useWorkspace();
  const {
    data: members = [],
    isLoading,
    isError,
  } = useWorkspaceMembers(workspaceId);
  const updateRoleMutation = useUpdateWorkspaceMemberRole(workspaceId);
  const removeMemberMutation = useRemoveWorkspaceMember(workspaceId);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleChange = async (
    member: WorkspaceMember,
    newRole: Exclude<WorkspaceRole, "owner">,
  ) => {
    try {
      setErrorMessage(null);
      await updateRoleMutation.mutateAsync({
        userId: member.id,
        payload: { role: newRole },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Gagal mengubah peran anggota.");
      } else {
        setErrorMessage("Terjadi kesalahan yang tidak terduga.");
      }
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      setErrorMessage(null);
      await removeMemberMutation.mutateAsync(memberToRemove.id);
      setMemberToRemove(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Gagal menghapus anggota.");
      } else {
        setErrorMessage("Terjadi kesalahan yang tidak terduga.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Anggota Workspace
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelola pengguna dan hak akses di workspace ini ({members.length}{" "}
            anggota).
          </p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="size-4" />
            <span>Tambah Anggota</span>
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          Gagal memuat daftar anggota workspace.
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Belum ada anggota di workspace ini.
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                {canManageMembers && (
                  <TableHead className="w-[80px] text-right">Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback>
                          {member.name
                            ? member.name.charAt(0).toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant[member.role]}>
                      {roleLabel[member.role]}
                    </Badge>
                  </TableCell>
                  {canManageMembers && (
                    <TableCell className="text-right">
                      {member.role === "owner" ? (
                        <span className="text-xs text-zinc-400 italic">
                          Utama
                        </span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Ubah Peran</DropdownMenuLabel>
                              <DropdownMenuItem
                                disabled={member.role === "admin"}
                                onClick={() => handleRoleChange(member, "admin")}
                                className="gap-2"
                              >
                                <Shield className="size-4" />
                                <span>Set sebagai Admin</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={member.role === "member"}
                                onClick={() => handleRoleChange(member, "member")}
                                className="gap-2"
                              >
                                <Shield className="size-4" />
                                <span>Set sebagai Member</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={member.role === "viewer"}
                                onClick={() => handleRoleChange(member, "viewer")}
                                className="gap-2"
                              >
                                <Shield className="size-4" />
                                <span>Set sebagai Viewer</span>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setMemberToRemove(member)}
                              className="gap-2 text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="size-4" />
                              <span>Hapus Anggota</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {canManageMembers && (
        <InviteMemberDialog
          workspaceId={workspaceId}
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
        />
      )}

      {memberToRemove && (
        <AlertDialog
          open={!!memberToRemove}
          onOpenChange={(open) => !open && setMemberToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Anggota?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus {memberToRemove.name} (
                {memberToRemove.email}) dari workspace ini?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={removeMemberMutation.isPending}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveMember();
                }}
                disabled={removeMemberMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {removeMemberMutation.isPending
                  ? "Menghapus..."
                  : "Hapus Anggota"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
