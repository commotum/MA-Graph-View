"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import type { GraphSource } from "@/lib/data-source";
import { buildTopicHref } from "@/lib/data-source";
import type { GraphData, TopicPlacement } from "@/lib/graph-data";
import {
  parseHid,
  selectTopicLabel,
  selectTopicPlacements,
} from "@/lib/graph-data";
import { cn } from "@/lib/utils";

type LocalDependencyCardProps = {
  graph: GraphData;
  dataSource: GraphSource;
  selectedTopicId: number | null;
  title?: string;
  description?: string;
  descriptionTemplate?: string;
  view?: ViewMode;
  showViewToggle?: boolean;
  showCollapseToggle?: boolean;
  defaultDepth?: number;
  depth?: number;
  onDepthChange?: (depth: number) => void;
  minDepth?: number;
  maxDepth?: number;
};

type Direction = "prereqs" | "unlocks";
type ViewMode = Direction | "both";

type BaseEntry = {
  id: number;
  label: string;
  placements: string[];
  moduleId: string | null;
  moduleLabel: string;
};

type SliceEntry = BaseEntry & {
  depth: number;
};

type MergedEntry = BaseEntry & {
  directions: Direction[];
  depthByDirection: Partial<Record<Direction, number>>;
  minDepth: number;
};

type GroupedEntries<T extends BaseEntry> = {
  id: string;
  label: string;
  entries: T[];
};

const DEPTH_MIN = 1;
const DEPTH_MAX = 6;
const UNPLACED_KEY = "unplaced";

const parseIdParts = (value: string): number[] =>
  value
    .split(".")
    .map((part) => Number(part))
    .filter((part) => !Number.isNaN(part));

const compareIdParts = (left: string, right: string): number => {
  const leftParts = parseIdParts(left);
  const rightParts = parseIdParts(right);
  const maxLength = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;
    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }
  return 0;
};

const getPrimaryPlacement = (placements: string[]): TopicPlacement | null => {
  for (const hid of placements) {
    const parsed = parseHid(hid);
    if (parsed) {
      return parsed;
    }
  }
  return null;
};

const getModuleLabel = (graph: GraphData, moduleId: string | null): string => {
  if (!moduleId) {
    return "Unplaced";
  }
  const module = graph.modules[moduleId];
  if (!module) {
    return moduleId;
  }
  return `${moduleId} - ${module.name}`;
};

const formatPlacements = (placements: string[]): string => {
  if (!placements.length) {
    return "No placements";
  }
  const preview = placements.slice(0, 2);
  const suffix = placements.length > 2 ? ` +${placements.length - 2}` : "";
  return `${preview.join(", ")}${suffix}`;
};

const buildSliceEntries = (
  graph: GraphData,
  startId: number | null,
  direction: Direction,
  depthLimit: number
): SliceEntry[] => {
  if (startId === null) {
    return [];
  }
  const adjacency = direction === "prereqs" ? graph.graph.requires : graph.graph.unlocks;
  const visited = new Set<number>([startId]);
  const queue: Array<{ id: number; depth: number }> = [{ id: startId, depth: 0 }];
  const entries: SliceEntry[] = [];

  while (queue.length) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (current.depth >= depthLimit) {
      continue;
    }
    const neighbors = adjacency[String(current.id)] ?? [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }
      visited.add(neighbor);
      const nextDepth = current.depth + 1;
      const placements = selectTopicPlacements(graph, neighbor);
      const primaryPlacement = getPrimaryPlacement(placements);
      entries.push({
        id: neighbor,
        depth: nextDepth,
        label: selectTopicLabel(graph, neighbor),
        placements,
        moduleId: primaryPlacement?.moduleId ?? null,
        moduleLabel: getModuleLabel(graph, primaryPlacement?.moduleId ?? null),
      });
      queue.push({ id: neighbor, depth: nextDepth });
    }
  }

  return entries;
};

const sortEntries = (entries: SliceEntry[]): SliceEntry[] =>
  entries
    .slice()
    .sort((a, b) => a.depth - b.depth || a.label.localeCompare(b.label));

const sortMergedEntries = (entries: MergedEntry[]): MergedEntry[] =>
  entries
    .slice()
    .sort((a, b) => a.minDepth - b.minDepth || a.label.localeCompare(b.label));

const groupEntries = <T extends BaseEntry>(entries: T[]): GroupedEntries<T>[] => {
  const groups = new Map<string, GroupedEntries<T>>();
  entries.forEach((entry) => {
    const key = entry.moduleId ?? UNPLACED_KEY;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        label: entry.moduleLabel,
        entries: [],
      });
    }
    groups.get(key)?.entries.push(entry);
  });

  return Array.from(groups.values()).sort((a, b) => {
    if (a.id === UNPLACED_KEY) {
      return 1;
    }
    if (b.id === UNPLACED_KEY) {
      return -1;
    }
    return compareIdParts(a.id, b.id);
  });
};

const mergeEntries = (
  prereqEntries: SliceEntry[],
  unlockEntries: SliceEntry[]
): MergedEntry[] => {
  const merged = new Map<number, MergedEntry>();

  const addEntry = (entry: SliceEntry, direction: Direction) => {
    const existing = merged.get(entry.id);
    if (existing) {
      if (!existing.directions.includes(direction)) {
        existing.directions.push(direction);
      }
      existing.depthByDirection[direction] = entry.depth;
      existing.minDepth = Math.min(existing.minDepth, entry.depth);
      return;
    }

    merged.set(entry.id, {
      id: entry.id,
      label: entry.label,
      placements: entry.placements,
      moduleId: entry.moduleId,
      moduleLabel: entry.moduleLabel,
      directions: [direction],
      depthByDirection: { [direction]: entry.depth },
      minDepth: entry.depth,
    });
  };

  prereqEntries.forEach((entry) => addEntry(entry, "prereqs"));
  unlockEntries.forEach((entry) => addEntry(entry, "unlocks"));

  return Array.from(merged.values());
};

const TopicRow = ({
  graph,
  entry,
  onSelect,
  isActive,
}: {
  graph: GraphData;
  entry: SliceEntry;
  onSelect: (id: number) => void;
  isActive: boolean;
}) => {
  const prereqCount = graph.graph.requires[String(entry.id)]?.length ?? 0;
  const unlockCount = graph.graph.unlocks[String(entry.id)]?.length ?? 0;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onSelect(entry.id)}
          className={cn(
            "flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-muted/40",
            isActive && "bg-muted/60"
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums">
              Depth {entry.depth}
            </span>
            <span className="text-sm font-medium">{entry.label}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              ID {entry.id}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatPlacements(entry.placements)}
          </div>
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="grid gap-2">
        <div className="text-sm font-semibold">{entry.label}</div>
        <div className="text-xs text-muted-foreground">Topic ID {entry.id}</div>
        <div className="text-xs text-muted-foreground">
          Prereqs {prereqCount} - Unlocks {unlockCount}
        </div>
        <div className="grid gap-1 text-xs text-muted-foreground">
          <div>Module: {entry.moduleLabel}</div>
          <div>Placements: {formatPlacements(entry.placements)}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const DirectionBadge = ({
  direction,
  depth,
}: {
  direction: Direction;
  depth: number;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
      direction === "prereqs"
        ? "bg-primary/10 text-primary"
        : "bg-secondary text-secondary-foreground"
    )}
  >
    {direction === "prereqs" ? "Prereq" : "Unlock"}
    <span className="tabular-nums">d{depth}</span>
  </span>
);

const MergedTopicRow = ({
  graph,
  entry,
  onSelect,
  isActive,
}: {
  graph: GraphData;
  entry: MergedEntry;
  onSelect: (id: number) => void;
  isActive: boolean;
}) => {
  const prereqCount = graph.graph.requires[String(entry.id)]?.length ?? 0;
  const unlockCount = graph.graph.unlocks[String(entry.id)]?.length ?? 0;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onSelect(entry.id)}
          className={cn(
            "flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-muted/40",
            isActive && "bg-muted/60"
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            {entry.directions.map((direction) => {
              const depth = entry.depthByDirection[direction];
              if (!depth) {
                return null;
              }
              return (
                <DirectionBadge key={direction} direction={direction} depth={depth} />
              );
            })}
            <span className="text-sm font-medium">{entry.label}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              ID {entry.id}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatPlacements(entry.placements)}
          </div>
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="grid gap-2">
        <div className="text-sm font-semibold">{entry.label}</div>
        <div className="text-xs text-muted-foreground">Topic ID {entry.id}</div>
        <div className="text-xs text-muted-foreground">
          Prereqs {prereqCount} - Unlocks {unlockCount}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {entry.directions.map((direction) => {
            const depth = entry.depthByDirection[direction];
            if (!depth) {
              return null;
            }
            return (
              <span key={direction}>
                {direction === "prereqs" ? "Prereq" : "Unlock"} depth {depth}
              </span>
            );
          })}
        </div>
        <div className="grid gap-1 text-xs text-muted-foreground">
          <div>Module: {entry.moduleLabel}</div>
          <div>Placements: {formatPlacements(entry.placements)}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const DependencyList = ({
  graph,
  title,
  entries,
  emptyMessage,
  collapseByModule,
  selectedTopicId,
  onSelect,
}: {
  graph: GraphData;
  title: string;
  entries: SliceEntry[];
  emptyMessage: string;
  collapseByModule: boolean;
  selectedTopicId: number | null;
  onSelect: (id: number) => void;
}) => {
  const content = collapseByModule ? groupEntries(entries) : [];

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{title}</span>
        <span className="text-xs text-muted-foreground">{entries.length} topics</span>
      </div>
      <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border">
        {entries.length ? (
          collapseByModule ? (
            <div className="divide-y divide-border">
              {content.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center justify-between bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
                    <span className="truncate">{group.label}</span>
                    <span>{group.entries.length}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {sortEntries(group.entries).map((entry) => (
                      <TopicRow
                        key={entry.id}
                        graph={graph}
                        entry={entry}
                        onSelect={onSelect}
                        isActive={selectedTopicId === entry.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortEntries(entries).map((entry) => (
                <TopicRow
                  key={entry.id}
                  graph={graph}
                  entry={entry}
                  onSelect={onSelect}
                  isActive={selectedTopicId === entry.id}
                />
              ))}
            </div>
          )
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
};

const MergedDependencyList = ({
  graph,
  title,
  entries,
  emptyMessage,
  collapseByModule,
  selectedTopicId,
  onSelect,
}: {
  graph: GraphData;
  title: string;
  entries: MergedEntry[];
  emptyMessage: string;
  collapseByModule: boolean;
  selectedTopicId: number | null;
  onSelect: (id: number) => void;
}) => {
  const content = collapseByModule ? groupEntries(entries) : [];

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{title}</span>
        <span className="text-xs text-muted-foreground">{entries.length} topics</span>
      </div>
      <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border">
        {entries.length ? (
          collapseByModule ? (
            <div className="divide-y divide-border">
              {content.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center justify-between bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
                    <span className="truncate">{group.label}</span>
                    <span>{group.entries.length}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {sortMergedEntries(group.entries).map((entry) => (
                      <MergedTopicRow
                        key={entry.id}
                        graph={graph}
                        entry={entry}
                        onSelect={onSelect}
                        isActive={selectedTopicId === entry.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortMergedEntries(entries).map((entry) => (
                <MergedTopicRow
                  key={entry.id}
                  graph={graph}
                  entry={entry}
                  onSelect={onSelect}
                  isActive={selectedTopicId === entry.id}
                />
              ))}
            </div>
          )
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
};

export function LocalDependencyCard({
  graph,
  dataSource,
  selectedTopicId,
  title,
  description,
  descriptionTemplate,
  view,
  showViewToggle,
  showCollapseToggle,
  defaultDepth,
  depth,
  onDepthChange,
  minDepth,
  maxDepth,
}: LocalDependencyCardProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<ViewMode>(view ?? "prereqs");
  const [internalDepth, setInternalDepth] = React.useState(defaultDepth ?? 3);
  const [collapseByModule, setCollapseByModule] = React.useState(true);
  const effectiveMode = view ?? mode;
  const resolvedDepth = depth ?? internalDepth;
  const minDepthValue = minDepth ?? DEPTH_MIN;
  const maxDepthValue = maxDepth ?? DEPTH_MAX;
  const clampedDepth = Math.min(maxDepthValue, Math.max(minDepthValue, resolvedDepth));
  const isDepthControlled = depth !== undefined;
  const depthChangeDisabled = isDepthControlled && !onDepthChange;
  const shouldShowViewToggle = showViewToggle ?? view === undefined;
  const shouldShowCollapseToggle = showCollapseToggle ?? true;
  const resolvedTitle = title ?? "Local Dependencies";

  React.useEffect(() => {
    if (view) {
      setMode(view);
    }
  }, [view]);
  React.useEffect(() => {
    if (!isDepthControlled && defaultDepth !== undefined) {
      setInternalDepth(defaultDepth);
    }
  }, [defaultDepth, isDepthControlled]);

  const prereqEntries = React.useMemo(
    () => buildSliceEntries(graph, selectedTopicId, "prereqs", clampedDepth),
    [graph, selectedTopicId, clampedDepth]
  );
  const unlockEntries = React.useMemo(
    () => buildSliceEntries(graph, selectedTopicId, "unlocks", clampedDepth),
    [graph, selectedTopicId, clampedDepth]
  );
  const mergedEntries = React.useMemo(
    () => mergeEntries(prereqEntries, unlockEntries),
    [prereqEntries, unlockEntries]
  );

  const handleSelect = React.useCallback(
    (id: number) => {
      router.push(buildTopicHref(id, dataSource));
    },
    [dataSource, router]
  );

  if (selectedTopicId === null) {
    const emptyDescription =
      effectiveMode === "prereqs"
        ? "Select a topic to explore prerequisites."
        : effectiveMode === "unlocks"
          ? "Select a topic to explore unlocks."
          : "Select a topic to explore prerequisites and unlocks.";
    return (
      <Card>
        <CardHeader>
          <CardTitle>{resolvedTitle}</CardTitle>
          <CardDescription>{emptyDescription}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const resolvedDescription =
    description ??
    (descriptionTemplate
      ? descriptionTemplate.replace("{depth}", String(clampedDepth))
      : shouldShowViewToggle
        ? `Explore prerequisites and unlocks up to ${clampedDepth} hops.`
        : effectiveMode === "prereqs"
          ? `Explore prerequisites up to ${clampedDepth} hops.`
          : effectiveMode === "unlocks"
            ? `Explore unlocks up to ${clampedDepth} hops.`
            : `Explore prerequisites and unlocks up to ${clampedDepth} hops.`);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{resolvedTitle}</CardTitle>
        <CardDescription>{resolvedDescription}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {shouldShowViewToggle ? (
            <ToggleGroup
              type="single"
              value={effectiveMode}
              onValueChange={(value) => setMode((value as ViewMode) || "prereqs")}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="prereqs">Prereqs</ToggleGroupItem>
              <ToggleGroupItem value="unlocks">Unlocks</ToggleGroupItem>
              <ToggleGroupItem value="both">Neighborhood</ToggleGroupItem>
            </ToggleGroup>
          ) : null}
          {shouldShowCollapseToggle ? (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={collapseByModule}
                onChange={(event) => setCollapseByModule(event.target.checked)}
                className="border-input text-primary h-4 w-4 rounded-sm"
              />
              Collapse by module
            </label>
          ) : null}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Depth {clampedDepth}</span>
            <input
              type="range"
              min={minDepthValue}
              max={maxDepthValue}
              value={clampedDepth}
              onChange={(event) => {
                const nextDepth = Number(event.target.value);
                if (!isDepthControlled) {
                  setInternalDepth(nextDepth);
                }
                onDepthChange?.(nextDepth);
              }}
              disabled={depthChangeDisabled}
              className="accent-primary h-2 w-32 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
        {effectiveMode === "both" ? (
          <MergedDependencyList
            graph={graph}
            title="Neighborhood (Prereqs + Unlocks)"
            entries={mergedEntries}
            emptyMessage="No neighbors found within the current depth."
            collapseByModule={collapseByModule}
            selectedTopicId={selectedTopicId}
            onSelect={handleSelect}
          />
        ) : effectiveMode === "prereqs" ? (
          <DependencyList
            graph={graph}
            title="Prerequisites"
            entries={prereqEntries}
            emptyMessage="No prerequisites found within the current depth."
            collapseByModule={collapseByModule}
            selectedTopicId={selectedTopicId}
            onSelect={handleSelect}
          />
        ) : (
          <DependencyList
            graph={graph}
            title="Unlocks"
            entries={unlockEntries}
            emptyMessage="No unlocks found within the current depth."
            collapseByModule={collapseByModule}
            selectedTopicId={selectedTopicId}
            onSelect={handleSelect}
          />
        )}
      </CardContent>
    </Card>
  );
}
