import type { GraphData } from "./graph-data";
import { selectTopicLabel, selectTopicName, selectTopicPlacements } from "./graph-data";

export type TopicSearchItem = {
  id: number;
  label: string;
  name: string;
  placements: string[];
  searchText: string;
};

export const buildTopicSearchItems = (graph: GraphData): TopicSearchItem[] =>
  graph.topics.ordered_ids.map((id) => {
    const name = selectTopicName(graph, id) ?? "";
    const label = selectTopicLabel(graph, id);
    const placements = selectTopicPlacements(graph, id);
    const searchText = [String(id), label, name, ...placements]
      .join(" ")
      .toLowerCase();
    return {
      id,
      label,
      name: name || label,
      placements,
      searchText,
    };
  });

export const filterTopicSearchItems = (
  items: TopicSearchItem[],
  query: string,
  limit?: number
): TopicSearchItem[] => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [];
  }
  const tokens = trimmed.split(/\s+/);
  const matches = items.filter((item) =>
    tokens.every((token) => item.searchText.includes(token))
  );
  return typeof limit === "number" ? matches.slice(0, limit) : matches;
};
