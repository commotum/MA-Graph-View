"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

import type { GraphData } from "@/lib/graph-data";
import { selectTopicLabel } from "@/lib/graph-data";
import type { TopicSearchItem } from "@/lib/topic-search";
import { filterTopicSearchItems } from "@/lib/topic-search";

type PathViewsCardProps = {
  graph: GraphData;
  selectedTopicId: number | null;
  topicSearchItems: TopicSearchItem[];
};

type DrawerMode = "shortest" | "critical";

const SEARCH_LIMIT = 6;

const computeShortestPath = (
  graph: GraphData,
  startId: number | null,
  targetId: number | null
): number[] | null => {
  if (startId === null || targetId === null) {
    return null;
  }
  if (startId === targetId) {
    return [startId];
  }

  const queue: number[] = [startId];
  const visited = new Set<number>([startId]);
  const prev = new Map<number, number | null>([[startId, null]]);

  while (queue.length) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }
    const neighbors = graph.graph.unlocks[String(current)] ?? [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }
      visited.add(neighbor);
      prev.set(neighbor, current);
      if (neighbor === targetId) {
        const path: number[] = [];
        let step: number | null = neighbor;
        while (step !== null) {
          path.push(step);
          step = prev.get(step) ?? null;
        }
        return path.reverse();
      }
      queue.push(neighbor);
    }
  }

  return null;
};

const computeCriticalChain = (
  graph: GraphData,
  targetId: number | null
): number[] | null => {
  if (targetId === null || graph.stats.has_cycle) {
    return null;
  }

  const dist = new Map<number, number>();
  const prev = new Map<number, number | null>();

  graph.topics.ordered_ids.forEach((id) => {
    dist.set(id, 0);
    prev.set(id, null);
  });

  graph.graph.topo_order.forEach((id) => {
    const prereqs = graph.graph.requires[String(id)] ?? [];
    let best = dist.get(id) ?? 0;
    let bestPrev = prev.get(id) ?? null;
    prereqs.forEach((prereq) => {
      const candidate = (dist.get(prereq) ?? 0) + 1;
      if (candidate > best) {
        best = candidate;
        bestPrev = prereq;
      }
    });
    dist.set(id, best);
    prev.set(id, bestPrev);
  });

  if (!dist.has(targetId)) {
    return null;
  }

  const path: number[] = [];
  let step: number | null = targetId;
  while (step !== null) {
    path.push(step);
    step = prev.get(step) ?? null;
  }
  return path.reverse();
};

const PathList = ({
  graph,
  path,
  emptyMessage,
  onSelect,
}: {
  graph: GraphData;
  path: number[] | null;
  emptyMessage: string;
  onSelect: (id: number) => void;
}) => {
  if (!path) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-3">
      <div className="text-xs text-muted-foreground">
        {path.length} topics, {Math.max(0, path.length - 1)} edges
      </div>
      <ol className="grid gap-2">
        {path.map((id, index) => (
          <li key={`${id}-${index}`}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              className="flex w-full items-start gap-3 rounded-lg border border-border px-3 py-2 text-left transition hover:bg-muted/40"
            >
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {selectTopicLabel(graph, id)}
                </div>
                <div className="text-xs text-muted-foreground">ID {id}</div>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

export function PathViewsCard({
  graph,
  selectedTopicId,
  topicSearchItems,
}: PathViewsCardProps) {
  const router = useRouter();
  const [sourceQuery, setSourceQuery] = React.useState("");
  const [sourceId, setSourceId] = React.useState<number | null>(null);
  const [drawerMode, setDrawerMode] = React.useState<DrawerMode | null>(null);

  const targetLabel =
    selectedTopicId !== null ? selectTopicLabel(graph, selectedTopicId) : null;
  const sourceItem = React.useMemo(
    () => (sourceId !== null ? topicSearchItems.find((item) => item.id === sourceId) : null),
    [sourceId, topicSearchItems]
  );

  const results = React.useMemo(
    () => filterTopicSearchItems(topicSearchItems, sourceQuery, SEARCH_LIMIT),
    [topicSearchItems, sourceQuery]
  );

  const shortestPath = React.useMemo(
    () => computeShortestPath(graph, sourceId, selectedTopicId),
    [graph, sourceId, selectedTopicId]
  );
  const criticalPath = React.useMemo(
    () => computeCriticalChain(graph, selectedTopicId),
    [graph, selectedTopicId]
  );

  const handleSourceChange = (value: string) => {
    setSourceQuery(value);
    setSourceId(null);
  };

  const handleSelectSource = (item: TopicSearchItem) => {
    setSourceId(item.id);
    setSourceQuery(item.label);
  };

  const handleNavigate = React.useCallback(
    (id: number) => {
      router.push(`/?topic=${id}`);
    },
    [router]
  );

  if (selectedTopicId === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Path Views</CardTitle>
          <CardDescription>Select a topic to explore dependency paths.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Path Views</CardTitle>
        <CardDescription>Explain how prerequisites lead to the selected topic.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="rounded-lg border border-border px-4 py-3">
          <div className="text-xs text-muted-foreground">Target topic</div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold">{targetLabel}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              ID {selectedTopicId}
            </span>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-3">
            <div className="text-sm font-medium">Shortest path</div>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Start topic</span>
                <Input
                  placeholder="Search by name or ID"
                  value={sourceQuery}
                  onChange={(event) => handleSourceChange(event.target.value)}
                />
              </div>
              {sourceItem ? (
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  Selected: {sourceItem.label} (ID {sourceItem.id})
                </div>
              ) : null}
              {sourceQuery.trim().length && !sourceItem ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  {results.length ? (
                    <div className="divide-y divide-border">
                      {results.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSource(item)}
                          className="flex w-full flex-col gap-1 px-3 py-2 text-left transition hover:bg-muted/40"
                        >
                          <span className="text-xs text-muted-foreground tabular-nums">
                            ID {item.id}
                          </span>
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      No matches yet.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <Button
              variant="outline"
              onClick={() => setDrawerMode("shortest")}
              disabled={!sourceId}
              className="w-fit"
            >
              Show shortest path
            </Button>
          </div>
          <div className="grid gap-3">
            <div className="text-sm font-medium">Critical chain</div>
            <div className="text-xs text-muted-foreground">
              Longest prerequisite chain ending at the selected topic.
            </div>
            <Button
              variant="outline"
              onClick={() => setDrawerMode("critical")}
              disabled={graph.stats.has_cycle}
              className="w-fit"
            >
              Show critical chain
            </Button>
            {graph.stats.has_cycle ? (
              <div className="text-xs text-muted-foreground">
                Critical chain is unavailable while cycles exist.
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
      <Drawer open={drawerMode !== null} onOpenChange={(open) => (!open ? setDrawerMode(null) : null)}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>
              {drawerMode === "critical" ? "Critical chain" : "Shortest path"}
            </DrawerTitle>
            <DrawerDescription>
              {drawerMode === "critical"
                ? `Longest prerequisite chain ending at ${targetLabel}.`
                : sourceItem
                  ? `From ${sourceItem.label} to ${targetLabel}.`
                  : "Select a start topic to view the path."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid max-h-[60vh] gap-4 overflow-y-auto px-4 pb-6">
            {drawerMode === "critical" ? (
              <PathList
                graph={graph}
                path={criticalPath}
                emptyMessage="No critical chain available for the selected topic."
                onSelect={handleNavigate}
              />
            ) : (
              <PathList
                graph={graph}
                path={shortestPath}
                emptyMessage={
                  sourceItem
                    ? "No path found between the selected topics."
                    : "Select a start topic to compute a path."
                }
                onSelect={handleNavigate}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}
