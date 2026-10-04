"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";

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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useWorkspace } from "../context/workspace-context";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const {
    workspaces,
    selectedWorkspace,
    setSelectedWorkspaceId,
    isLoading,
    isError,
  } = useWorkspace();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleSelect = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    router.push(`/workspaces/${workspaceId}`);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                />
              }
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
                {selectedWorkspace ? (
                  selectedWorkspace.name.charAt(0).toUpperCase()
                ) : (
                  <Building2 className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {isLoading
                    ? "Memuat..."
                    : selectedWorkspace
                      ? selectedWorkspace.name
                      : "Pilih Workspace"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {selectedWorkspace
                    ? selectedWorkspace.slug
                    : workspaces.length === 0
                      ? "Belum ada workspace"
                      : "FlowTask SaaS"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--anchor-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Workspace Saya
                </DropdownMenuLabel>

                {isLoading ? (
                  <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                    Memuat workspace...
                  </div>
                ) : isError ? (
                  <div className="px-2 py-3 text-xs text-red-500 text-center">
                    Gagal memuat workspace
                  </div>
                ) : workspaces.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                    Belum ada workspace
                  </div>
                ) : (
                  workspaces.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => handleSelect(workspace.id)}
                      className="gap-2 p-2 cursor-pointer"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border text-xs font-bold bg-zinc-100 dark:bg-zinc-800">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 truncate">{workspace.name}</span>
                      {selectedWorkspace?.id === workspace.id && (
                        <Check className="size-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2 p-2 cursor-pointer font-medium text-primary"
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
                  <Plus className="size-4" />
                </div>
                <span>Buat Workspace Baru</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
