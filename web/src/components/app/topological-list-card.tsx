"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { GraphData, TopicPlacement } from "@/lib/graph-data";
import {
  parseHid,
  selectCourses,
  selectModulesByUnit,
  selectTopicLabel,
  selectTopicName,
  selectTopicPlacements,
  selectUnitsByCourse,
} from "@/lib/graph-data";
import { cn } from "@/lib/utils";

type TopologicalListCardProps = {
  graph: GraphData;
  selectedTopicId: number | null;
};

type TopoListItem = {
  id: number;
  order: number;
  label: string;
  name: string;
  placements: string[];
  courseIds: string[];
  unitIds: string[];
  moduleIds: string[];
  searchText: string;
};

const ALL_VALUE = "all";

const buildTopoItems = (graph: GraphData): TopoListItem[] =>
  graph.graph.topo_order.map((id, index) => {
    const placements = selectTopicPlacements(graph, id);
    const placementDetails = placements
      .map((hid) => parseHid(hid))
      .filter((placement): placement is TopicPlacement => Boolean(placement));
    const courseIds = new Set<string>();
    const unitIds = new Set<string>();
    const moduleIds = new Set<string>();
    placementDetails.forEach((placement) => {
      courseIds.add(placement.courseId);
      unitIds.add(placement.unitId);
      moduleIds.add(placement.moduleId);
    });
    const name = selectTopicName(graph, id) ?? "";
    const label = selectTopicLabel(graph, id);
    const searchText = [String(id), label, name, ...placements]
      .join(" ")
      .toLowerCase();
    return {
      id,
      order: index + 1,
      label,
      name: name || label,
      placements,
      courseIds: Array.from(courseIds),
      unitIds: Array.from(unitIds),
      moduleIds: Array.from(moduleIds),
      searchText,
    };
  });

const formatPlacements = (placements: string[]): string => {
  if (!placements.length) {
    return "No placements";
  }
  const preview = placements.slice(0, 2);
  const suffix = placements.length > 2 ? ` +${placements.length - 2}` : "";
  return `${preview.join(", ")}${suffix}`;
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  placeholder: string;
}) => (
  <div className="grid gap-1">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className={cn(
        "border-input bg-background text-foreground h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
    >
      <option value={ALL_VALUE}>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export function TopologicalListCard({
  graph,
  selectedTopicId,
}: TopologicalListCardProps) {
  const router = useRouter();
  const [courseId, setCourseId] = React.useState(ALL_VALUE);
  const [unitId, setUnitId] = React.useState(ALL_VALUE);
  const [moduleId, setModuleId] = React.useState(ALL_VALUE);
  const [query, setQuery] = React.useState("");

  const courses = React.useMemo(() => selectCourses(graph), [graph]);
  const units = React.useMemo(
    () => (courseId !== ALL_VALUE ? selectUnitsByCourse(graph, courseId) : []),
    [graph, courseId]
  );
  const modules = React.useMemo(
    () => (unitId !== ALL_VALUE ? selectModulesByUnit(graph, unitId) : []),
    [graph, unitId]
  );
  const topoItems = React.useMemo(() => buildTopoItems(graph), [graph]);

  const filteredItems = React.useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return topoItems.filter((item) => {
      if (courseId !== ALL_VALUE && !item.courseIds.includes(courseId)) {
        return false;
      }
      if (unitId !== ALL_VALUE && !item.unitIds.includes(unitId)) {
        return false;
      }
      if (moduleId !== ALL_VALUE && !item.moduleIds.includes(moduleId)) {
        return false;
      }
      if (tokens.length && !tokens.every((token) => item.searchText.includes(token))) {
        return false;
      }
      return true;
    });
  }, [courseId, moduleId, query, topoItems, unitId]);

  const handleCourseChange = (value: string) => {
    setCourseId(value);
    setUnitId(ALL_VALUE);
    setModuleId(ALL_VALUE);
  };

  const handleUnitChange = (value: string) => {
    setUnitId(value);
    setModuleId(ALL_VALUE);
  };

  const handleSelect = React.useCallback(
    (id: number) => {
      router.push(`/?topic=${id}`);
    },
    [router]
  );

  if (graph.stats.has_cycle) {
    const cycleNodes = graph.graph.cycle_nodes;
    const preview = cycleNodes.slice(0, 24);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topological Order</CardTitle>
          <CardDescription>
            Cycles detected - resolve cycles to view the full topological list.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div>{cycleNodes.length} nodes are part of cycles.</div>
          <div className="flex flex-wrap gap-2">
            {preview.map((id) => (
              <span
                key={id}
                className="rounded-md border border-border px-2 py-1 text-xs text-foreground"
              >
                {selectTopicLabel(graph, id)}
              </span>
            ))}
          </div>
          {cycleNodes.length > preview.length ? (
            <div className="text-xs text-muted-foreground">
              Showing {preview.length} of {cycleNodes.length} cycle nodes.
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topological Order</CardTitle>
        <CardDescription>
          Browse topics in dependency-safe order with course filters.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Course"
            value={courseId}
            onChange={handleCourseChange}
            placeholder="All courses"
            options={courses.map((course) => ({
              value: course.id,
              label: `${course.id} - ${course.name}`,
            }))}
          />
          <SelectField
            label="Unit"
            value={unitId}
            onChange={handleUnitChange}
            placeholder="All units"
            options={units.map((unit) => ({
              value: unit.id,
              label: `${unit.id} - ${unit.name}`,
            }))}
            disabled={courseId === ALL_VALUE}
          />
          <SelectField
            label="Module"
            value={moduleId}
            onChange={setModuleId}
            placeholder="All modules"
            options={modules.map((module) => ({
              value: module.id,
              label: `${module.id} - ${module.name}`,
            }))}
            disabled={unitId === ALL_VALUE}
          />
          <div className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Search</span>
            <Input
              placeholder="Search name, ID, or placement"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {filteredItems.length} of {topoItems.length} topics.
        </div>
        <div className="max-h-[520px] overflow-y-auto rounded-lg border border-border">
          {filteredItems.length ? (
            <ul className="divide-y divide-border">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-muted/40",
                      selectedTopicId === item.id && "bg-muted/60"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {item.order}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        ID {item.id}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatPlacements(item.placements)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              No topics match the current filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
