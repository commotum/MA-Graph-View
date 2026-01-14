import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { TopicSearch } from "@/components/app/topic-search";

import type { GraphData } from "@/lib/graph-data";
import {
  selectCourses,
  selectModulesByUnit,
  selectTopicsByModule,
  selectUnitsByCourse,
} from "@/lib/graph-data";
import type { TopicSearchItem } from "@/lib/topic-search";

type AppSidebarProps = {
  graph: GraphData;
  selectedTopicId: number | null;
  topicSearchItems: TopicSearchItem[];
};

export function AppSidebar({
  graph,
  selectedTopicId,
  topicSearchItems,
}: AppSidebarProps) {
  const courses = selectCourses(graph);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TopicSearch items={topicSearchItems} selectedTopicId={selectedTopicId} />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {courses.map((course, index) => {
          const units = selectUnitsByCourse(graph, course.id);
          return (
            <SidebarGroup key={course.id}>
              <SidebarGroupLabel>
                {course.id} — {course.name}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {units.map((unit) => (
                    <SidebarMenuItem key={unit.id}>
                      <SidebarMenuButton type="button">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {unit.id}
                        </span>
                        <span className="truncate">{unit.name}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {selectModulesByUnit(graph, unit.id).map((module) => {
                          const topics = selectTopicsByModule(graph, module.id);
                          return (
                            <SidebarMenuSubItem key={module.id}>
                              <SidebarMenuSubButton asChild>
                                <span>
                                  <span className="text-[11px] text-muted-foreground tabular-nums">
                                    {module.id}
                                  </span>
                                  <span className="truncate">{module.name}</span>
                                </span>
                              </SidebarMenuSubButton>
                              <SidebarMenuSub className="mt-1">
                                {topics.map((topic) => (
                                  <SidebarMenuSubItem key={topic.hid}>
                                    <SidebarMenuSubButton
                                      asChild
                                      size="sm"
                                      isActive={topic.id === selectedTopicId}
                                    >
                                      <Link href={`/?topic=${topic.id}`}>
                                        <span className="text-[11px] text-muted-foreground tabular-nums">
                                          {topic.hid}
                                        </span>
                                        <span className="truncate">{topic.label}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
              {index < courses.length - 1 ? <SidebarSeparator /> : null}
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
