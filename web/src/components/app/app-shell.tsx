import type { ReactNode } from "react";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

import type { GraphData } from "@/lib/graph-data";
import { AppSidebar } from "@/components/app/app-sidebar";
import { TopicCommandPalette } from "@/components/app/topic-command-palette";
import type { TopicSearchItem } from "@/lib/topic-search";
import { ThemeToggle } from "@/components/app/theme-toggle";

type AppShellProps = {
  graph: GraphData;
  selectedTopicId: number | null;
  topicSearchItems: TopicSearchItem[];
  headerTitle?: string;
  headerSubtitle?: string;
  children: ReactNode;
};

export function AppShell({
  graph,
  selectedTopicId,
  topicSearchItems,
  headerTitle,
  headerSubtitle,
  children,
}: AppShellProps) {
  const resolvedTitle = headerTitle ?? "Dependency Browser";
  const resolvedSubtitle = headerSubtitle ?? "Math Academy";

  return (
    <SidebarProvider>
      <TopicCommandPalette
        items={topicSearchItems}
        selectedTopicId={selectedTopicId}
      />
      <AppSidebar graph={graph} selectedTopicId={selectedTopicId} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
          <SidebarTrigger />
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">{resolvedSubtitle}</div>
            <h1 className="text-lg font-semibold text-foreground">{resolvedTitle}</h1>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-6 px-6 py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
