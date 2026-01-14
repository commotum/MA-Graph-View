import { AppShell } from "@/components/app/app-shell";
import { GraphSummaryCard } from "@/components/app/graph-summary-card";
import { TopicDetailCard } from "@/components/app/topic-detail-card";
import { getGraph } from "@/lib/graph";

export default async function Home() {
  const graph = await getGraph();
  const topicId = graph.topics.ordered_ids[0] ?? null;

  return (
    <AppShell graph={graph}>
      <div className="grid gap-6 lg:grid-cols-2">
        <GraphSummaryCard graph={graph} />
        <TopicDetailCard graph={graph} topicId={topicId} />
      </div>
    </AppShell>
  );
}
