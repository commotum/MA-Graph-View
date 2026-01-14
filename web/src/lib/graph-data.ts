export type GraphStats = {
  topics: number;
  catalog_rows: number;
  edges: number;
  roots: number;
  sinks: number;
  has_cycle: boolean;
};

export type CourseRecord = {
  name: string;
  units: string[];
};

export type UnitRecord = {
  name: string;
  course_id: string;
  modules: string[];
};

export type ModuleRecord = {
  name: string;
  unit_id: string;
  topics: number[];
  topic_hids: string[];
};

export type TopicRecord = {
  name: string;
  placements: string[];
};

export type GraphData = {
  version: number;
  generated_at: string;
  stats: GraphStats;
  courses: Record<string, CourseRecord>;
  units: Record<string, UnitRecord>;
  modules: Record<string, ModuleRecord>;
  topics: {
    by_id: Record<string, TopicRecord>;
    ordered_ids: number[];
  };
  catalog: {
    hid_to_topic: Record<string, number>;
    topic_to_hids: Record<string, string[]>;
  };
  graph: {
    requires: Record<string, number[]>;
    unlocks: Record<string, number[]>;
    in_degree: Record<string, number>;
    out_degree: Record<string, number>;
    roots: number[];
    sinks: number[];
    topo_order: number[];
    cycle_nodes: number[];
  };
  duplicates: {
    topic_names: Record<string, number[]>;
    topic_ids: Record<string, string[]>;
  };
};

export type TopicIdInput = number | string;

export type TopicPlacement = {
  hid: string;
  courseId: string;
  unitId: string;
  moduleId: string;
  topicIndex: number;
};

export type Breadcrumb = {
  hid: string;
  course: { id: string; name: string };
  unit: { id: string; name: string };
  module: { id: string; name: string };
  topic: { id: number; name: string };
};

export type ModuleTopic = {
  id: number;
  hid: string;
  name: string;
  label: string;
};

const toTopicKey = (id: TopicIdInput): string =>
  typeof id === "number" ? String(id) : id.trim();

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

export const parseHid = (hid: string): TopicPlacement | null => {
  const parts = parseIdParts(hid);
  if (parts.length !== 4) {
    return null;
  }
  const [course, unit, module, topicIndex] = parts;
  return {
    hid,
    courseId: String(course),
    unitId: `${course}.${unit}`,
    moduleId: `${course}.${unit}.${module}`,
    topicIndex,
  };
};

export const selectCourses = (graph: GraphData): Array<
  { id: string } & CourseRecord
> =>
  Object.keys(graph.courses)
    .sort(compareIdParts)
    .map((id) => ({ id, ...graph.courses[id] }));

export const selectUnitsByCourse = (
  graph: GraphData,
  courseId: string
): Array<{ id: string } & UnitRecord> => {
  const course = graph.courses[courseId];
  if (!course) {
    return [];
  }
  return course.units
    .map((unitId) => graph.units[unitId])
    .map((unit, index) => ({
      id: course.units[index],
      name: unit?.name ?? "",
      course_id: unit?.course_id ?? courseId,
      modules: unit?.modules ?? [],
    }));
};

export const selectModulesByUnit = (
  graph: GraphData,
  unitId: string
): Array<{ id: string } & ModuleRecord> => {
  const unit = graph.units[unitId];
  if (!unit) {
    return [];
  }
  return unit.modules
    .map((moduleId) => graph.modules[moduleId])
    .map((module, index) => ({
      id: unit.modules[index],
      name: module?.name ?? "",
      unit_id: module?.unit_id ?? unitId,
      topics: module?.topics ?? [],
      topic_hids: module?.topic_hids ?? [],
    }));
};

export const selectTopicsByModule = (
  graph: GraphData,
  moduleId: string
): ModuleTopic[] => {
  const module = graph.modules[moduleId];
  if (!module) {
    return [];
  }
  return module.topics.map((topicId, index) => {
    const hid = module.topic_hids[index] ?? "";
    const name = selectTopicName(graph, topicId) ?? "";
    return {
      id: topicId,
      hid,
      name,
      label: selectTopicLabel(graph, topicId),
    };
  });
};

export const selectTopicById = (
  graph: GraphData,
  id: TopicIdInput
): TopicRecord | null => {
  const key = toTopicKey(id);
  return graph.topics.by_id[key] ?? null;
};

export const selectTopicName = (
  graph: GraphData,
  id: TopicIdInput
): string | null => {
  const topic = selectTopicById(graph, id);
  return topic?.name ?? null;
};

export const selectTopicLabel = (graph: GraphData, id: TopicIdInput): string => {
  const name = selectTopicName(graph, id);
  if (!name) {
    return toTopicKey(id);
  }
  const duplicates = graph.duplicates.topic_names[name];
  if (duplicates && duplicates.length > 1) {
    return `${name} (ID ${toTopicKey(id)})`;
  }
  return name;
};

export const selectTopicPlacements = (
  graph: GraphData,
  id: TopicIdInput
): string[] => {
  const key = toTopicKey(id);
  const topic = graph.topics.by_id[key];
  if (topic?.placements?.length) {
    return topic.placements.slice();
  }
  const fallback = graph.catalog.topic_to_hids[key];
  return fallback ? fallback.slice() : [];
};

export const selectTopicPlacementDetails = (
  graph: GraphData,
  id: TopicIdInput
): TopicPlacement[] =>
  selectTopicPlacements(graph, id)
    .map((hid) => parseHid(hid))
    .filter((placement): placement is TopicPlacement => Boolean(placement));

export const selectBreadcrumbs = (
  graph: GraphData,
  id: TopicIdInput
): Breadcrumb[] => {
  const topicId = Number(toTopicKey(id));
  const topicName = selectTopicName(graph, id) ?? "";
  return selectTopicPlacementDetails(graph, id).map((placement) => {
    const course = graph.courses[placement.courseId];
    const unit = graph.units[placement.unitId];
    const module = graph.modules[placement.moduleId];
    return {
      hid: placement.hid,
      course: { id: placement.courseId, name: course?.name ?? "" },
      unit: { id: placement.unitId, name: unit?.name ?? "" },
      module: { id: placement.moduleId, name: module?.name ?? "" },
      topic: { id: topicId, name: topicName },
    };
  });
};

export const selectTopicIdByHid = (
  graph: GraphData,
  hid: string
): number | null => graph.catalog.hid_to_topic[hid] ?? null;

export const selectPrereqs = (
  graph: GraphData,
  id: TopicIdInput
): number[] => {
  const key = toTopicKey(id);
  return graph.graph.requires[key]?.slice() ?? [];
};

export const selectUnlocks = (
  graph: GraphData,
  id: TopicIdInput
): number[] => {
  const key = toTopicKey(id);
  return graph.graph.unlocks[key]?.slice() ?? [];
};

export const selectTopoOrder = (graph: GraphData): number[] =>
  graph.graph.topo_order.slice();

export const selectRoots = (graph: GraphData): number[] =>
  graph.graph.roots.slice();

export const selectSinks = (graph: GraphData): number[] =>
  graph.graph.sinks.slice();

export const selectHasCycle = (graph: GraphData): boolean =>
  graph.stats.has_cycle;

export const selectCycleNodes = (graph: GraphData): number[] =>
  graph.graph.cycle_nodes.slice();
