import { AppShell } from "@/components/app/app-shell";
import { GraphSummaryCard } from "@/components/app/graph-summary-card";
import { TopologicalListCard } from "@/components/app/topological-list-card";
import { TopicBreadcrumbsCard } from "@/components/app/topic-breadcrumbs-card";
import { TopicDetailCard } from "@/components/app/topic-detail-card";
import { getGraph, selectTopicIdByHid } from "@/lib/graph";
import type { GraphData } from "@/lib/graph-data";
import { buildTopicSearchItems } from "@/lib/topic-search";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: SearchParams;
};

const getSearchParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const resolveTopicId = (graph: GraphData, searchParams?: SearchParams): number | null => {
  const hidParam = getSearchParam(searchParams?.hid);
  if (hidParam) {
    const resolved = selectTopicIdByHid(graph, hidParam);
    if (resolved !== null) {
      return resolved;
    }
  }

  const topicParam = getSearchParam(searchParams?.topic);
  if (topicParam) {
    const parsed = Number(topicParam);
    if (Number.isFinite(parsed) && graph.topics.by_id[String(parsed)]) {
      return parsed;
    }
    return null;
  }

  return graph.topics.ordered_ids[0] ?? null;
};

export default async function Home({ searchParams }: PageProps) {
  const graph = await getGraph();
  const topicId = resolveTopicId(graph, searchParams);
  const topicSearchItems = buildTopicSearchItems(graph);

  return (
    <AppShell
      graph={graph}
      selectedTopicId={topicId}
      topicSearchItems={topicSearchItems}
    >
      <>
        <TopicBreadcrumbsCard graph={graph} topicId={topicId} />
        <div className="grid gap-6 lg:grid-cols-2">
          <GraphSummaryCard graph={graph} />
          <TopicDetailCard graph={graph} topicId={topicId} />
        </div>
        <TopologicalListCard graph={graph} selectedTopicId={topicId} />
      </>
    </AppShell>
  );
}
