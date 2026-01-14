import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { GraphData } from "@/lib/graph-data";
import { selectTopicLabel } from "@/lib/graph-data";

type GraphMetricsCardProps = {
  graph: GraphData;
};

type HotspotItem = {
  id: number;
  label: string;
  count: number;
};

type ComponentSummary = {
  count: number;
  sizes: number[];
};

const HOTSPOT_LIMIT = 6;

const buildHotspots = (
  graph: GraphData,
  degrees: Record<string, number>
): HotspotItem[] => {
  const candidates = graph.topics.ordered_ids.map((id) => ({
    id,
    count: degrees[String(id)] ?? 0,
  }));

  return candidates
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.id - b.id)
    .slice(0, HOTSPOT_LIMIT)
    .map((entry) => ({
      ...entry,
      label: selectTopicLabel(graph, entry.id),
    }));
};

const computeLongestChain = (
  graph: GraphData
): { nodes: number; edges: number } | null => {
  if (graph.stats.has_cycle) {
    return null;
  }

  const longestById = new Map<number, number>();
  graph.topics.ordered_ids.forEach((id) => {
    longestById.set(id, 0);
  });

  graph.graph.topo_order.forEach((id) => {
    const current = longestById.get(id) ?? 0;
    const neighbors = graph.graph.unlocks[String(id)] ?? [];
    neighbors.forEach((neighbor) => {
      const next = current + 1;
      if ((longestById.get(neighbor) ?? 0) < next) {
        longestById.set(neighbor, next);
      }
    });
  });

  const edges = Math.max(0, ...longestById.values());
  return {
    edges,
    nodes: edges + 1,
  };
};

const computeWeakComponents = (graph: GraphData): ComponentSummary => {
  const adjacency = new Map<number, Set<number>>();

  graph.topics.ordered_ids.forEach((id) => {
    adjacency.set(id, new Set());
  });

  Object.entries(graph.graph.requires).forEach(([key, prereqs]) => {
    const node = Number(key);
    const neighbors = adjacency.get(node);
    if (!neighbors) {
      return;
    }
    prereqs.forEach((prereq) => {
      neighbors.add(prereq);
      adjacency.get(prereq)?.add(node);
    });
  });

  const visited = new Set<number>();
  const sizes: number[] = [];

  adjacency.forEach((_, start) => {
    if (visited.has(start)) {
      return;
    }
    let size = 0;
    const queue: number[] = [start];
    visited.add(start);
    while (queue.length) {
      const current = queue.shift();
      if (current === undefined) {
        break;
      }
      size += 1;
      adjacency.get(current)?.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }
    sizes.push(size);
  });

  sizes.sort((a, b) => b - a);
  return {
    count: sizes.length,
    sizes,
  };
};

const HotspotList = ({ title, items }: { title: string; items: HotspotItem[] }) => (
  <div className="grid gap-2">
    <div className="text-sm font-medium">{title}</div>
    <div className="overflow-hidden rounded-lg border border-border">
      {items.length ? (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">ID {item.id}</div>
              </div>
              <div className="text-sm font-semibold tabular-nums">{item.count}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-3 py-3 text-xs text-muted-foreground">
          No topics with edges found.
        </div>
      )}
    </div>
  </div>
);

export function GraphMetricsCard({ graph }: GraphMetricsCardProps) {
  const inHotspots = buildHotspots(graph, graph.graph.in_degree);
  const outHotspots = buildHotspots(graph, graph.graph.out_degree);
  const longestChain = computeLongestChain(graph);
  const components = computeWeakComponents(graph);
  const componentPreview = components.sizes.slice(0, 4);
  const componentLabel = componentPreview.length
    ? componentPreview.join(", ")
    : "None";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Structure Metrics</CardTitle>
        <CardDescription>High-level hotspots and connectivity overview.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <HotspotList title="In-degree hotspots" items={inHotspots} />
          <HotspotList title="Out-degree hotspots" items={outHotspots} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border px-4 py-3">
            <div className="text-xs text-muted-foreground">Longest chain</div>
            {longestChain ? (
              <div className="mt-2 text-lg font-semibold">
                {longestChain.nodes} topics
                <span className="text-xs text-muted-foreground">
                  {" "}
                  ({longestChain.edges} edges)
                </span>
              </div>
            ) : (
              <div className="mt-2 text-sm text-muted-foreground">
                Unavailable - cycles detected
              </div>
            )}
          </div>
          <div className="rounded-lg border border-border px-4 py-3">
            <div className="text-xs text-muted-foreground">Graph islands</div>
            <div className="mt-2 text-lg font-semibold tabular-nums">
              {components.count}
            </div>
            <div className="text-xs text-muted-foreground">
              Largest sizes: {componentLabel}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
