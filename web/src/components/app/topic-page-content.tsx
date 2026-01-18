"use client";

import * as React from "react";

import { LocalDependencyCard } from "@/components/app/local-dependency-card";
import { TangleTreeCard } from "@/components/app/tangle-tree-card";

import type { GraphSource } from "@/lib/data-source";
import type { GraphData } from "@/lib/graph-data";

type TopicPageContentProps = {
  graph: GraphData;
  dataSource: GraphSource;
  selectedTopicId: number | null;
};

export function TopicPageContent({
  graph,
  dataSource,
  selectedTopicId,
}: TopicPageContentProps) {
  const [depth, setDepth] = React.useState(3);

  return (
    <>
      <TangleTreeCard
        graph={graph}
        dataSource={dataSource}
        selectedTopicId={selectedTopicId}
        focusTopicId={selectedTopicId}
        depthLimit={depth}
        title="Focused Tangle Tree"
        description="Bundled edges over prerequisite layers for the selected topic."
      />
      <LocalDependencyCard
        graph={graph}
        dataSource={dataSource}
        selectedTopicId={selectedTopicId}
        view="prereqs"
        showViewToggle={false}
        title="Prerequisites"
        descriptionTemplate="Prerequisites up to {depth} hops."
        depth={depth}
        onDepthChange={setDepth}
      />
      <TangleTreeCard
        graph={graph}
        dataSource={dataSource}
        selectedTopicId={selectedTopicId}
        title="Full Graph Tangle Tree"
        description="Bundled edges for the entire prerequisite graph."
      />
    </>
  );
}
