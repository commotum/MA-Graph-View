import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { GraphData } from "./graph-data";
import { resolveGraphSource, type GraphSource } from "./data-source";

const GRAPH_PATHS: Record<GraphSource, string> = {
  default: path.resolve(process.cwd(), "..", "DATA", "graph.json"),
  ece: path.resolve(process.cwd(), "..", "ECE-DATA", "graph.json"),
};

const cachedGraphs = new Map<GraphSource, GraphData>();

const readGraphFile = async (source: GraphSource): Promise<GraphData> => {
  const raw = await readFile(GRAPH_PATHS[source], "utf-8");
  return JSON.parse(raw) as GraphData;
};

export const getGraph = async (source?: GraphSource | string | null): Promise<GraphData> => {
  const resolvedSource = resolveGraphSource(source);
  const cached = cachedGraphs.get(resolvedSource);
  if (cached) {
    return cached;
  }
  const graph = await readGraphFile(resolvedSource);
  cachedGraphs.set(resolvedSource, graph);
  return graph;
};

export * from "./graph-data";
