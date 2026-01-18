import { TopicPage } from "@/components/app/topic-page";
import { getGraph, selectTopicIdByHid } from "@/lib/graph";
import { resolveGraphSource } from "@/lib/data-source";
import type { GraphData } from "@/lib/graph-data";
import { buildTopicSearchItems } from "@/lib/topic-search";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
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
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const dataSource = resolveGraphSource(getSearchParam(resolvedSearchParams?.dataset));
  const graph = await getGraph(dataSource);
  const topicId = resolveTopicId(graph, resolvedSearchParams);
  const topicSearchItems = buildTopicSearchItems(graph);

  return (
    <TopicPage
      graph={graph}
      dataSource={dataSource}
      selectedTopicId={topicId}
      topicSearchItems={topicSearchItems}
    />
  );
}
