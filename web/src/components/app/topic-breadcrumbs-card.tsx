import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { GraphData } from "@/lib/graph-data";
import { selectBreadcrumbs, selectTopicLabel } from "@/lib/graph-data";

type TopicBreadcrumbsCardProps = {
  graph: GraphData;
  topicId: number | null;
};

const formatLabel = (id: string, name: string): string =>
  name ? `${id} - ${name}` : id;

export function TopicBreadcrumbsCard({ graph, topicId }: TopicBreadcrumbsCardProps) {
  if (topicId === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topic Breadcrumbs</CardTitle>
          <CardDescription>Select a topic to view placements.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const breadcrumbs = selectBreadcrumbs(graph, topicId);
  const topicLabel = selectTopicLabel(graph, topicId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Breadcrumbs</CardTitle>
        <CardDescription>Curriculum placements for {topicLabel}.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {breadcrumbs.length ? (
          breadcrumbs.map((crumb) => (
            <div
              key={crumb.hid}
              className="rounded-lg border border-border bg-card/50 px-3 py-2"
            >
              <div className="text-xs text-muted-foreground">Placement {crumb.hid}</div>
              <Breadcrumb className="mt-1">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <span>{formatLabel(crumb.course.id, crumb.course.name)}</span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <span>{formatLabel(crumb.unit.id, crumb.unit.name)}</span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <span>{formatLabel(crumb.module.id, crumb.module.name)}</span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{topicLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">
            No placements recorded for this topic.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
