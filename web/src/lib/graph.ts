import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { GraphData } from "./graph-data";

const GRAPH_PATH = path.resolve(process.cwd(), "..", "DATA", "graph.json");

let cachedGraph: GraphData | null = null;

const readGraphFile = async (): Promise<GraphData> => {
  const raw = await readFile(GRAPH_PATH, "utf-8");
  return JSON.parse(raw) as GraphData;
};

export const getGraph = async (): Promise<GraphData> => {
  if (!cachedGraph) {
    cachedGraph = await readGraphFile();
  }
  return cachedGraph;
};

export * from "./graph-data";
