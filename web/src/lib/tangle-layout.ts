import type { GraphData } from "./graph-data";
import { buildTopicLayers } from "./graph-data";

type TangleLevel = {
  level: number;
  nodes: TangleNode[];
  bundles: TangleBundle[];
};

type TangleBundleGroup = {
  id: string;
  bundles: TangleBundle[];
  i: number;
};

export type TangleNode = {
  id: number;
  level: number;
  parentIds: number[];
  parents: TangleNode[];
  bundle?: TangleBundle;
  bundleGroupsById: Record<string, TangleBundleGroup>;
  bundleGroups: TangleBundleGroup[];
  x: number;
  y: number;
  height: number;
};

export type TangleBundle = {
  id: string;
  parents: TangleNode[];
  level: number;
  span: number;
  i: number;
  x: number;
  y: number;
  links: TangleLink[];
};

export type TangleLink = {
  source: TangleNode;
  target: TangleNode;
  bundle: TangleBundle;
  xt: number;
  yt: number;
  xb: number;
  yb: number;
  xs: number;
  ys: number;
  c1: number;
  c2: number;
};

export type TangleLayout = {
  levels: TangleLevel[];
  nodes: TangleNode[];
  links: TangleLink[];
  bundles: TangleBundle[];
  layout: {
    width: number;
    height: number;
    nodeHeight: number;
    nodeWidth: number;
    bundleWidth: number;
    levelYPadding: number;
    metroD: number;
  };
};

export type TangleLayoutOptions = {
  padding?: number;
  nodeHeight?: number;
  nodeWidth?: number;
  bundleWidth?: number;
  levelYPadding?: number;
  metroD?: number;
  minFamilyHeight?: number;
  c?: number;
  bigc?: number;
};

const minBy = <T>(items: T[], fn: (item: T) => number, fallback = 0): number => {
  if (!items.length) {
    return fallback;
  }
  let value = Infinity;
  for (const item of items) {
    value = Math.min(value, fn(item));
  }
  return Number.isFinite(value) ? value : fallback;
};

const maxBy = <T>(items: T[], fn: (item: T) => number, fallback = 0): number => {
  if (!items.length) {
    return fallback;
  }
  let value = -Infinity;
  for (const item of items) {
    value = Math.max(value, fn(item));
  }
  return Number.isFinite(value) ? value : fallback;
};

const buildLevels = (
  graph: GraphData,
  allowedIds?: Set<number>
): { levels: TangleLevel[]; levelsById: Record<string, number> } => {
  const { layers, levelsById } = buildTopicLayers(graph, allowedIds);
  const levels: TangleLevel[] = layers.map((layer) => ({
    level: layer.level,
    nodes: layer.topicIds.map((id) => ({
      id,
      level: layer.level,
      parentIds: (graph.graph.requires[String(id)] ?? []).filter(
        (parentId) => levelsById[String(parentId)] !== undefined
      ),
      parents: [],
      bundleGroupsById: {},
      bundleGroups: [],
      x: 0,
      y: 0,
      height: 0,
    })),
    bundles: [],
  }));

  return { levels, levelsById };
};

const buildLevelsFromFocus = (
  graph: GraphData,
  focusTopicId: number,
  depthLimit?: number
): TangleLevel[] => {
  if (!Number.isFinite(focusTopicId)) {
    return [];
  }
  const maxDepth =
    depthLimit === undefined || depthLimit === null ? Number.POSITIVE_INFINITY : depthLimit;
  const depthById = new Map<number, number>();
  const parentIdsById = new Map<number, Set<number>>();
  const queue: Array<{ id: number; depth: number }> = [{ id: focusTopicId, depth: 0 }];

  depthById.set(focusTopicId, 0);
  parentIdsById.set(focusTopicId, new Set());

  while (queue.length) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (current.depth >= maxDepth) {
      continue;
    }
    const prereqs = graph.graph.requires[String(current.id)] ?? [];
    prereqs.forEach((prereq) => {
      const nextDepth = current.depth + 1;
      if (nextDepth > maxDepth) {
        return;
      }
      const existingDepth = depthById.get(prereq);
      if (existingDepth === undefined) {
        depthById.set(prereq, nextDepth);
        parentIdsById.set(prereq, new Set([current.id]));
        queue.push({ id: prereq, depth: nextDepth });
      } else if (existingDepth === nextDepth) {
        parentIdsById.get(prereq)?.add(current.id);
      }
    });
  }

  if (!depthById.size) {
    return [];
  }

  const order =
    graph.graph.topo_order.length > 0 ? graph.graph.topo_order : graph.topics.ordered_ids;
  const levelBuckets: Array<number[] | undefined> = [];
  order.forEach((id) => {
    const depth = depthById.get(id);
    if (depth === undefined) {
      return;
    }
    if (!levelBuckets[depth]) {
      levelBuckets[depth] = [];
    }
    levelBuckets[depth]?.push(id);
  });

  if (!levelBuckets[0] || !levelBuckets[0].includes(focusTopicId)) {
    levelBuckets[0] = [focusTopicId, ...(levelBuckets[0] ?? [])];
  }

  return levelBuckets.flatMap((topicIds, depth) => {
    if (!topicIds) {
      return [];
    }
    return [
      {
        level: depth,
        nodes: topicIds.map((id) => ({
          id,
          level: depth,
          parentIds: Array.from(parentIdsById.get(id) ?? []),
          parents: [],
          bundleGroupsById: {},
          bundleGroups: [],
          x: 0,
          y: 0,
          height: 0,
        })),
        bundles: [],
      },
    ];
  });
};

export const buildTangleLayout = (
  graph: GraphData,
  options: TangleLayoutOptions = {}
): TangleLayout => {
  const { levels } = buildLevels(graph);
  return constructTangleLayout(levels, options);
};

export const buildTopicTangleLayout = (
  graph: GraphData,
  focusTopicId: number,
  depthLimit?: number,
  options: TangleLayoutOptions = {}
): TangleLayout | null => {
  const levels = buildLevelsFromFocus(graph, focusTopicId, depthLimit);
  if (!levels.length) {
    return null;
  }
  return constructTangleLayout(levels, options);
};

const constructTangleLayout = (
  levels: TangleLevel[],
  options: TangleLayoutOptions
): TangleLayout => {
  levels.forEach((level, index) =>
    level.nodes.forEach((node) => {
      node.level = index;
    })
  );

  const nodes = levels.flatMap((level) => level.nodes);
  const nodesIndex: Record<string, TangleNode> = {};
  nodes.forEach((node) => {
    nodesIndex[String(node.id)] = node;
  });

  nodes.forEach((node) => {
    node.parents = node.parentIds
      .map((parentId) => nodesIndex[String(parentId)])
      .filter((parent): parent is TangleNode => Boolean(parent));
  });

  levels.forEach((level, index) => {
    const bundleIndex: Record<string, TangleBundle> = {};
    level.nodes.forEach((node) => {
      if (!node.parents.length) {
        return;
      }
      const id = node.parents
        .map((parent) => parent.id)
        .sort((a, b) => a - b)
        .join("-X-");
      if (bundleIndex[id]) {
        bundleIndex[id].parents = bundleIndex[id].parents.concat(node.parents);
      } else {
        bundleIndex[id] = {
          id,
          parents: node.parents.slice(),
          level: index,
          span: index - minBy(node.parents, (parent) => parent.level, index),
          i: 0,
          x: 0,
          y: 0,
          links: [],
        };
      }
      node.bundle = bundleIndex[id];
    });
    level.bundles = Object.values(bundleIndex);
    level.bundles.forEach((bundle, bundleIndex) => {
      bundle.i = bundleIndex;
    });
  });

  const links: TangleLink[] = [];
  nodes.forEach((node) => {
    if (!node.bundle) {
      return;
    }
    node.parents.forEach((parent) => {
      const link: TangleLink = {
        source: node,
        target: parent,
        bundle: node.bundle as TangleBundle,
        xt: 0,
        yt: 0,
        xb: 0,
        yb: 0,
        xs: 0,
        ys: 0,
        c1: 0,
        c2: 0,
      };
      links.push(link);
      node.bundle?.links.push(link);
    });
  });

  const bundles = levels.flatMap((level) => level.bundles);

  bundles.forEach((bundle) => {
    bundle.parents.forEach((parent) => {
      let group = parent.bundleGroupsById[bundle.id];
      if (!group) {
        group = { id: bundle.id, bundles: [], i: 0 };
        parent.bundleGroupsById[bundle.id] = group;
      }
      group.bundles.push(bundle);
    });
  });

  nodes.forEach((node) => {
    const groups = Object.values(node.bundleGroupsById);
    groups.sort(
      (a, b) => maxBy(b.bundles, (bundle) => bundle.span) - maxBy(a.bundles, (bundle) => bundle.span)
    );
    groups.forEach((group, index) => {
      group.i = index;
    });
    node.bundleGroups = groups;
  });

  const padding = options.padding ?? 8;
  const nodeHeight = options.nodeHeight ?? 22;
  const nodeWidth = options.nodeWidth ?? 96;
  const bundleWidth = options.bundleWidth ?? 14;
  const levelYPadding = options.levelYPadding ?? 16;
  const metroD = options.metroD ?? 4;
  const minFamilyHeight = options.minFamilyHeight ?? 22;
  const c = options.c ?? 16;
  const bigc = options.bigc ?? nodeWidth + c;

  nodes.forEach((node) => {
    node.height = (Math.max(1, node.bundleGroups.length) - 1) * metroD;
  });

  let xOffset = padding;
  let yOffset = padding;
  levels.forEach((level) => {
    xOffset += level.bundles.length * bundleWidth;
    yOffset += levelYPadding;
    level.nodes.forEach((node) => {
      node.x = node.level * nodeWidth + xOffset;
      node.y = nodeHeight + yOffset + node.height / 2;
      yOffset += nodeHeight + node.height;
    });
  });

  let levelIndex = 0;
  levels.forEach((level) => {
    level.bundles.forEach((bundle) => {
      bundle.x =
        maxBy(bundle.parents, (parent) => parent.x, 0) +
        nodeWidth +
        (level.bundles.length - 1 - bundle.i) * bundleWidth;
      bundle.y = levelIndex * nodeHeight;
    });
    levelIndex += level.nodes.length;
  });

  links.forEach((link) => {
    const groupIndex = link.target.bundleGroupsById[link.bundle.id]?.i ?? 0;
    const groupCount = link.target.bundleGroups.length;
    link.xt = link.target.x;
    link.yt =
      link.target.y + groupIndex * metroD - (groupCount * metroD) / 2 + metroD / 2;
    link.xb = link.bundle.x;
    link.yb = link.bundle.y;
    link.xs = link.source.x;
    link.ys = link.source.y;
  });

  let yNegativeOffset = 0;
  levels.forEach((level) => {
    if (level.bundles.length) {
      const levelMin = minBy(
        level.bundles,
        (bundle) =>
          minBy(bundle.links ?? [], (link) => link.ys - 2 * c - (link.yt + c), 0),
        0
      );
      yNegativeOffset += -minFamilyHeight + levelMin;
    }
    level.nodes.forEach((node) => {
      node.y -= yNegativeOffset;
    });
  });

  links.forEach((link) => {
    const groupIndex = link.target.bundleGroupsById[link.bundle.id]?.i ?? 0;
    const groupCount = link.target.bundleGroups.length;
    link.yt =
      link.target.y + groupIndex * metroD - (groupCount * metroD) / 2 + metroD / 2;
    link.ys = link.source.y;
    link.c1 =
      link.source.level - link.target.level > 1
        ? Math.min(bigc, link.xb - link.xt, link.yb - link.yt) - c
        : c;
    link.c2 = c;
  });

  const layout = {
    width: maxBy(nodes, (node) => node.x, 0) + nodeWidth + 2 * padding,
    height: maxBy(nodes, (node) => node.y, 0) + nodeHeight / 2 + 2 * padding,
    nodeHeight,
    nodeWidth,
    bundleWidth,
    levelYPadding,
    metroD,
  };

  return { levels, nodes, links, bundles, layout };
};
