"use client";

import * as React from "react";

import { LocalDependencyCard } from "@/components/app/local-dependency-card";
import { TangleTreeCard } from "@/components/app/tangle-tree-card";

import type { GraphData } from "@/lib/graph-data";

type TopicPageContentProps = {
  graph: GraphData;
  selectedTopicId: number | null;
};

export function TopicPageContent({ graph, selectedTopicId }: TopicPageContentProps) {
  const [depth, setDepth] = React.useState(3);

  return (
    <>
      <TangleTreeCard
        graph={graph}
        selectedTopicId={selectedTopicId}
        focusTopicId={selectedTopicId}
        depthLimit={depth}
      />
      <LocalDependencyCard
        graph={graph}
        selectedTopicId={selectedTopicId}
        view="prereqs"
        showViewToggle={false}
        title="Prerequisites"
        descriptionTemplate="Prerequisites up to {depth} hops."
        depth={depth}
        onDepthChange={setDepth}
      />
    </>
  );
}
