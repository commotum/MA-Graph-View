import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { GraphData } from "@/lib/graph-data";
import {
  selectPrereqs,
  selectTopicLabel,
  selectTopicPlacements,
  selectUnlocks,
} from "@/lib/graph-data";

type TopicDetailCardProps = {
  graph: GraphData;
  topicId: number | null;
};

export function TopicDetailCard({ graph, topicId }: TopicDetailCardProps) {
  if (topicId === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No topic selected</CardTitle>
          <CardDescription>Select a topic to view details.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const name = selectTopicLabel(graph, topicId);
  const prereqs = selectPrereqs(graph, topicId);
  const unlocks = selectUnlocks(graph, topicId);
  const placements = selectTopicPlacements(graph, topicId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>Topic ID {topicId}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="text-sm text-muted-foreground">Prerequisites</div>
            <div className="text-2xl font-semibold">{prereqs.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Unlocks</div>
            <div className="text-2xl font-semibold">{unlocks.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Placements</div>
            <div className="text-2xl font-semibold">{placements.length}</div>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Curriculum Placements</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {placements.length ? (
              placements.map((hid) => (
                <span
                  key={hid}
                  className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground"
                >
                  {hid}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No placements.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
