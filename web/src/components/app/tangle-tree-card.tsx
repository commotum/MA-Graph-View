"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { GraphData } from "@/lib/graph-data";
import { selectTopicLabel } from "@/lib/graph-data";
import { buildTangleLayout, buildTopicTangleLayout } from "@/lib/tangle-layout";
import { cn } from "@/lib/utils";

type TangleTreeCardProps = {
  graph: GraphData;
  selectedTopicId: number | null;
  focusTopicId?: number | null;
  depthLimit?: number;
};

const BUNDLE_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function TangleTreeCard({
  graph,
  selectedTopicId,
  focusTopicId,
  depthLimit,
}: TangleTreeCardProps) {
  const router = useRouter();
  const layout = React.useMemo(() => {
    if (graph.stats.has_cycle) {
      return null;
    }
    if (focusTopicId === null) {
      return null;
    }
    if (focusTopicId !== undefined) {
      return buildTopicTangleLayout(graph, focusTopicId, depthLimit);
    }
    return buildTangleLayout(graph);
  }, [depthLimit, focusTopicId, graph]);

  const handleSelect = React.useCallback(
    (id: number) => {
      router.push(`/?topic=${id}`);
    },
    [router]
  );

  if (graph.stats.has_cycle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tangle Tree</CardTitle>
          <CardDescription>
            Cycles detected - resolve cycles to render the tangle tree view.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {graph.graph.cycle_nodes.length} nodes are part of cycles.
        </CardContent>
      </Card>
    );
  }

  if (focusTopicId === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tangle Tree</CardTitle>
          <CardDescription>Select a topic to render its prerequisite tree.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!layout || !layout.nodes.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tangle Tree</CardTitle>
          <CardDescription>No nodes available to render.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tangle Tree</CardTitle>
        <CardDescription>Bundled edges over prerequisite layers.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="text-xs text-muted-foreground tabular-nums">
          {layout.levels.length} layers - {layout.nodes.length} nodes - {layout.links.length} edges
        </div>
        <div className="max-h-[640px] overflow-auto rounded-lg border border-border bg-muted/10">
          <svg
            width={layout.layout.width}
            height={layout.layout.height}
            viewBox={`0 0 ${layout.layout.width} ${layout.layout.height}`}
            className="block text-foreground"
            role="img"
            aria-label="Tangle tree of topic prerequisites"
          >
            {layout.bundles.map((bundle, index) => {
              if (!bundle.links.length) {
                return null;
              }
              const strokeColor = BUNDLE_PALETTE[index % BUNDLE_PALETTE.length];
              const d = bundle.links
                .map(
                  (link) => `
      M${link.xt} ${link.yt}
      L${link.xb - link.c1} ${link.yt}
      A${link.c1} ${link.c1} 90 0 1 ${link.xb} ${link.yt + link.c1}
      L${link.xb} ${link.ys - link.c2}
      A${link.c2} ${link.c2} 90 0 0 ${link.xb + link.c2} ${link.ys}
      L${link.xs} ${link.ys}`
                )
                .join("");
              return (
                <g key={bundle.id}>
                  <path d={d} fill="none" stroke="var(--card)" strokeWidth={5} />
                  <path d={d} fill="none" stroke={strokeColor} strokeWidth={2} />
                </g>
              );
            })}
            {layout.nodes.map((node) => {
              const label = selectTopicLabel(graph, node.id);
              const isSelected = selectedTopicId === node.id;
              return (
                <g
                  key={node.id}
                  onClick={() => handleSelect(node.id)}
                  className="cursor-pointer"
                >
                  <path
                    d={`M${node.x} ${node.y - node.height / 2} L${node.x} ${
                      node.y + node.height / 2
                    }`}
                    stroke={isSelected ? "var(--primary)" : "currentColor"}
                    strokeWidth={isSelected ? 6 : 4}
                    strokeLinecap="round"
                  />
                  <text
                    x={node.x + 6}
                    y={node.y - node.height / 2 - 4}
                    fill={isSelected ? "var(--primary)" : "currentColor"}
                    fontSize="10"
                    className={cn(isSelected && "font-semibold")}
                  >
                    {label}
                  </text>
                  <title>{label}</title>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
