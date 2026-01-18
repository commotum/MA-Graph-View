export type GraphSource = "default" | "ece";

export const DATASET_QUERY_KEY = "dataset";
export const ECE_DATASET_VALUE = "ece";

export const resolveGraphSource = (
  value?: string | string[] | null
): GraphSource => {
  const resolved = Array.isArray(value) ? value[0] : value;
  return resolved === ECE_DATASET_VALUE ? "ece" : "default";
};

export const buildTopicHref = (topicId: number, source: GraphSource): string => {
  const params = new URLSearchParams();
  params.set("topic", String(topicId));
  if (source === "ece") {
    params.set(DATASET_QUERY_KEY, ECE_DATASET_VALUE);
  }
  return `/?${params.toString()}`;
};

export const buildSearchParamsWithSource = (
  searchParams: URLSearchParams,
  source: GraphSource
): URLSearchParams => {
  const next = new URLSearchParams(searchParams);
  if (source === "ece") {
    next.set(DATASET_QUERY_KEY, ECE_DATASET_VALUE);
  } else {
    next.delete(DATASET_QUERY_KEY);
  }
  return next;
};
