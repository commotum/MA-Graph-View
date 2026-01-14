import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { GraphData } from "@/lib/graph-data";

type GraphSummaryCardProps = {
  graph: GraphData;
};

export function GraphSummaryCard({ graph }: GraphSummaryCardProps) {
  const { stats } = graph;
  const cycleCount = graph.graph.cycle_nodes.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Graph Summary</CardTitle>
        <CardDescription>Generated {graph.generated_at}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="text-sm text-muted-foreground">Topics</div>
          <div className="text-2xl font-semibold">{stats.topics}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Edges</div>
          <div className="text-2xl font-semibold">{stats.edges}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Roots</div>
          <div className="text-2xl font-semibold">{stats.roots}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Sinks</div>
          <div className="text-2xl font-semibold">{stats.sinks}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Cycle Status</div>
          <div className="text-sm font-medium text-foreground">
            {stats.has_cycle ? `${cycleCount} nodes in cycles` : "No cycles detected"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
