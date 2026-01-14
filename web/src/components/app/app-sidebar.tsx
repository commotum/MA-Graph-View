import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import type { GraphData } from "@/lib/graph-data";
import { selectCourses, selectUnitsByCourse } from "@/lib/graph-data";

type AppSidebarProps = {
  graph: GraphData;
};

export function AppSidebar({ graph }: AppSidebarProps) {
  const courses = selectCourses(graph);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarInput placeholder="Search topics (coming soon)" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {courses.map((course, index) => {
          const units = selectUnitsByCourse(graph, course.id);
          return (
            <SidebarGroup key={course.id}>
              <SidebarGroupLabel>{course.name}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {units.map((unit) => (
                    <SidebarMenuItem key={unit.id}>
                      <SidebarMenuButton type="button">
                        {unit.id} — {unit.name}
                      </SidebarMenuButton>
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
