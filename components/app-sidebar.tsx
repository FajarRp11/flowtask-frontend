"use client";

import {
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Building2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useWorkspace } from "@/features/workspace/context/workspace-context";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import Link from "next/link";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { selectedWorkspace } = useWorkspace();

  const mainNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    ...(selectedWorkspace
      ? [
        {
          title: selectedWorkspace.name,
          url: `/workspaces/${selectedWorkspace.id}`,
          icon: Building2,
        },
      ]
      : []),
    {
      title: "Proyek",
      url: selectedWorkspace ? `/workspaces/${selectedWorkspace.id}/projects` : "#",
      icon: FolderKanban,
    },
    {
      title: "Tugas Saya",
      url: "#",
      icon: CheckSquare,
    },
    {
      title: "Tim",
      url: "#",
      icon: Users,
    },
  ];

  const secondaryNavItems = [
    {
      title: "Pengaturan",
      url: "#",
      icon: Settings,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title} className="pb-1 last:pb-0">
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Lainnya</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-800 font-bold dark:bg-zinc-700 dark:text-zinc-100">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.name || "Pengguna"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email || ""}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              tooltip="Keluar"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <LogOut />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
