import type { ReactNode } from "react";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PanelLeftIcon } from "lucide-react";
import Image from "next/image";

import type { GraphSource } from "@/lib/data-source";
import type { GraphData } from "@/lib/graph-data";
import { AppSidebar } from "@/components/app/app-sidebar";
import { TopicCommandPalette } from "@/components/app/topic-command-palette";
import type { TopicSearchItem } from "@/lib/topic-search";
import { DataSourceToggle } from "@/components/app/data-source-toggle";
import { ThemeToggle } from "@/components/app/theme-toggle";

type AppShellProps = {
  graph: GraphData;
  dataSource: GraphSource;
  selectedTopicId: number | null;
  topicSearchItems: TopicSearchItem[];
  headerTitle?: string;
  headerSubtitle?: string;
  children: ReactNode;
};

export function AppShell({
  graph,
  dataSource,
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
        dataSource={dataSource}
      />
      <AppSidebar
        graph={graph}
        dataSource={dataSource}
        selectedTopicId={selectedTopicId}
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
          <SidebarTrigger className="md:hidden" />
          <SidebarTrigger
            aria-label="Open sidebar"
            className="group/logo relative hidden size-7 p-0 md:group-data-[state=collapsed]/sidebar-wrapper:inline-flex"
          >
            <Image
              src="/ma-logo.svg"
              alt="Math Academy"
              width={160}
              height={92}
              className="ma-logo h-4 w-auto shrink-0 transition-opacity group-hover/logo:opacity-0"
            />
            <PanelLeftIcon className="absolute inset-0 m-auto size-4 opacity-0 transition-opacity group-hover/logo:opacity-100" />
          </SidebarTrigger>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">{resolvedSubtitle}</div>
            <h1 className="text-lg font-semibold text-foreground">{resolvedTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <DataSourceToggle dataSource={dataSource} />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 px-6 py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
