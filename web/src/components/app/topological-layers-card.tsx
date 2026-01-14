"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { GraphData } from "@/lib/graph-data";
import { buildTopicLayers, selectTopicLabel } from "@/lib/graph-data";
import { cn } from "@/lib/utils";

type TopologicalLayersCardProps = {
  graph: GraphData;
  selectedTopicId: number | null;
};

export function TopologicalLayersCard({
  graph,
  selectedTopicId,
}: TopologicalLayersCardProps) {
  const router = useRouter();

  const { layers, levelsById } = React.useMemo(() => buildTopicLayers(graph), [graph]);
  const defaultOpenLayer =
    selectedTopicId !== null ? levelsById[String(selectedTopicId)] ?? 0 : 0;
  const totalTopics = graph.topics.ordered_ids.length;
  const maxDepth = layers.length ? layers[layers.length - 1].level : 0;
  const rootCount = layers[0]?.topicIds.length ?? 0;
  const [openLayers, setOpenLayers] = React.useState<Set<number>>(
    () => new Set([defaultOpenLayer])
  );

  React.useEffect(() => {
    setOpenLayers((prev) => {
      if (prev.has(defaultOpenLayer)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(defaultOpenLayer);
      return next;
    });
  }, [defaultOpenLayer]);

  const handleSelect = React.useCallback(
    (id: number) => {
      router.push(`/?topic=${id}`);
    },
    [router]
  );
  const handleToggle = React.useCallback((level: number, isOpen: boolean) => {
    setOpenLayers((prev) => {
      const next = new Set(prev);
      if (isOpen) {
        next.add(level);
      } else {
        next.delete(level);
      }
      return next;
    });
  }, []);

  if (graph.stats.has_cycle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topological Layers</CardTitle>
          <CardDescription>
            Cycles detected - layers are unavailable until the graph is acyclic.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {graph.graph.cycle_nodes.length} nodes are part of cycles.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topological Layers</CardTitle>
        <CardDescription>Grouped by maximum prerequisite depth.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="text-xs text-muted-foreground tabular-nums">
          {layers.length} layers - max depth {maxDepth} - {rootCount} roots - {totalTopics} topics
        </div>
        <div className="max-h-[520px] overflow-y-auto rounded-lg border border-border">
          {layers.map((layer) => (
            <details
              key={layer.level}
              open={openLayers.has(layer.level)}
              onToggle={(event) => handleToggle(layer.level, event.currentTarget.open)}
              className="border-b border-border last:border-b-0"
            >
              <summary className="flex cursor-pointer items-center justify-between px-4 py-2 text-sm font-medium list-none [&::-webkit-details-marker]:hidden">
                <span>Layer {layer.level}</span>
                <span className="text-xs text-muted-foreground">
                  {layer.topicIds.length} topics
                </span>
              </summary>
              <div className="grid gap-2 px-4 pb-3 pt-1 sm:grid-cols-2">
                {layer.topicIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelect(id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-sm transition hover:bg-muted/40",
                      selectedTopicId === id && "bg-muted/60"
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {selectTopicLabel(graph, id)}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ID {id}
                    </span>
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
