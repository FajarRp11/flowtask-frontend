import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import React from "react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                FlowTask
              </h1>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default AppLayout;
