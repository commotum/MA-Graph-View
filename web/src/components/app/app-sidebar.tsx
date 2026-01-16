import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

import type { GraphData } from "@/lib/graph-data";
import {
  selectTopicPlacementDetails,
  selectCourses,
  selectModulesByUnit,
  selectTopicsByModule,
  selectUnitsByCourse,
} from "@/lib/graph-data";
type AppSidebarProps = {
  graph: GraphData;
  selectedTopicId: number | null;
};

const stripCoursePrefix = (value: string, courseId: string): string =>
  value.startsWith(`${courseId}.`) ? value.slice(courseId.length + 1) : value;

export function AppSidebar({
  graph,
  selectedTopicId,
}: AppSidebarProps) {
  const courses = selectCourses(graph);
  const placementDetails =
    selectedTopicId !== null
      ? selectTopicPlacementDetails(graph, selectedTopicId)
      : [];
  const openCourseIds = new Set(placementDetails.map((placement) => placement.courseId));
  const openUnitIds = new Set(placementDetails.map((placement) => placement.unitId));
  const openModuleIds = new Set(placementDetails.map((placement) => placement.moduleId));

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader className="flex-row items-center justify-between gap-2">
        <a
          href="https://mathacademy.com/learn"
          target="_blank"
          rel="noreferrer"
          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-sidebar-accent"
          aria-label="Math Academy Learn (opens in a new tab)"
        >
          <Image
            src="/ma-logo.svg"
            alt="Math Academy"
            width={160}
            height={92}
            className="ma-logo h-4 w-auto shrink-0"
          />
        </a>
        <SidebarTrigger aria-label="Close sidebar" />
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:hidden pt-2">
        {courses.map((course, index) => {
          const units = selectUnitsByCourse(graph, course.id);
          const openCourse =
            openCourseIds.size > 0 ? openCourseIds.has(course.id) : true;
          return (
            <SidebarGroup key={course.id} className="py-0">
              <details open={openCourse} className="group/course">
                <SidebarGroupLabel asChild className="cursor-pointer text-sm font-semibold">
                  <summary className="flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
                    <span className="truncate">{course.name}</span>
                  </summary>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {units.map((unit) => {
                      const openUnit = openUnitIds.has(unit.id);
                      const unitLabel = stripCoursePrefix(unit.id, course.id);
                      return (
                        <SidebarMenuItem key={unit.id}>
                          <details open={openUnit} className="group/unit">
                            <SidebarMenuButton asChild className="cursor-pointer">
                              <summary className="list-none [&::-webkit-details-marker]:hidden">
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {unitLabel}
                                </span>
                                <span className="truncate">{unit.name}</span>
                              </summary>
                            </SidebarMenuButton>
                            <SidebarMenuSub>
                              {selectModulesByUnit(graph, unit.id).map((module) => {
                                const topics = selectTopicsByModule(graph, module.id);
                                const openModule = openModuleIds.has(module.id);
                                const moduleLabel = stripCoursePrefix(module.id, course.id);
                                return (
                                  <SidebarMenuSubItem key={module.id}>
                                    <details open={openModule} className="group/module">
                                      <SidebarMenuSubButton asChild className="cursor-pointer">
                                        <summary className="list-none [&::-webkit-details-marker]:hidden">
                                          <span className="text-[11px] text-muted-foreground tabular-nums">
                                            {moduleLabel}
                                          </span>
                                          <span className="truncate">{module.name}</span>
                                        </summary>
                                      </SidebarMenuSubButton>
                                      <SidebarMenuSub className="mt-1">
                                        {topics.map((topic) => {
                                          const topicLabel = stripCoursePrefix(
                                            topic.hid,
                                            course.id
                                          );
                                          return (
                                            <SidebarMenuSubItem key={topic.hid}>
                                              <SidebarMenuSubButton
                                                asChild
                                                size="sm"
                                                isActive={topic.id === selectedTopicId}
                                              >
                                                <Link href={`/?topic=${topic.id}`}>
                                                  <span className="text-[11px] text-muted-foreground tabular-nums">
                                                    {topicLabel}
                                                  </span>
                                                  <span className="truncate">{topic.label}</span>
                                                </Link>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          );
                                        })}
                                      </SidebarMenuSub>
                                    </details>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </details>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </details>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
