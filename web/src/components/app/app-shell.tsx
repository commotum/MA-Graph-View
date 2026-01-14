import type { ReactNode } from "react";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

import type { GraphData } from "@/lib/graph-data";
import { AppSidebar } from "@/components/app/app-sidebar";

type AppShellProps = {
  graph: GraphData;
  children: ReactNode;
};

export function AppShell({ graph, children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar graph={graph} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
          <SidebarTrigger />
          <div>
            <div className="text-sm text-muted-foreground">Math Academy</div>
            <h1 className="text-lg font-semibold text-foreground">
              Dependency Browser
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 px-6 py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
