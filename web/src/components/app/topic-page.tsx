import { AppShell } from "@/components/app/app-shell";
import { TopicPageContent } from "@/components/app/topic-page-content";

import type { GraphData } from "@/lib/graph-data";
import { selectTopicLabel, selectTopicPlacementDetails } from "@/lib/graph-data";
import type { TopicSearchItem } from "@/lib/topic-search";

type TopicPageProps = {
  graph: GraphData;
  selectedTopicId: number | null;
  topicSearchItems: TopicSearchItem[];
};

const getHeaderCopy = (
  graph: GraphData,
  selectedTopicId: number | null
): { title: string; subtitle: string } => {
  if (selectedTopicId === null) {
    return { title: "Select a topic", subtitle: "Math Academy" };
  }
  const label = selectTopicLabel(graph, selectedTopicId);
  const placements = selectTopicPlacementDetails(graph, selectedTopicId);
  const primaryPlacement = placements[0];
  const moduleName = primaryPlacement
    ? graph.modules[primaryPlacement.moduleId]?.name ?? "Unplaced Module"
    : "Unplaced Module";
  return { title: label, subtitle: moduleName };
};

export function TopicPage({ graph, selectedTopicId, topicSearchItems }: TopicPageProps) {
  const header = getHeaderCopy(graph, selectedTopicId);

  return (
    <AppShell
      graph={graph}
      selectedTopicId={selectedTopicId}
      topicSearchItems={topicSearchItems}
      headerTitle={header.title}
      headerSubtitle={header.subtitle}
    >
      <TopicPageContent graph={graph} selectedTopicId={selectedTopicId} />
    </AppShell>
  );
}
