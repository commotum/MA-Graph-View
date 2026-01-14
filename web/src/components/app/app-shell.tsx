import type { ReactNode } from "react";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

import type { GraphData } from "@/lib/graph-data";
import { AppSidebar } from "@/components/app/app-sidebar";
import { TopicCommandPalette } from "@/components/app/topic-command-palette";
import type { TopicSearchItem } from "@/lib/topic-search";

type AppShellProps = {
  graph: GraphData;
  selectedTopicId: number | null;
  topicSearchItems: TopicSearchItem[];
  children: ReactNode;
};

export function AppShell({
  graph,
  selectedTopicId,
  topicSearchItems,
  children,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <TopicCommandPalette
        items={topicSearchItems}
        selectedTopicId={selectedTopicId}
      />
      <AppSidebar
        graph={graph}
        selectedTopicId={selectedTopicId}
        topicSearchItems={topicSearchItems}
      />
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
