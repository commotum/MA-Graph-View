Math Academy Dependency Browser Plan

Goal
Build a usable, hierarchy-aware browser for Math Academy topic prerequisites using a DAG-first approach, with topo navigation and local graph views.

What We Know From the Data
- 3 courses (Mathematical Foundations I–III), 42 units, 149 modules, 1025 unique topics.
- Catalog hierarchy uses decimal IDs: course.unit.module.topic (e.g., 1.1.1.1).
- Topics list (Topics.csv) is the canonical ID → name map.
- Prerequisites.csv is an edge list of topic → requires.

Domain notes:
  - Topic ID 1060 is intentionally shared across MF2 and MF3 as the same topic placed in two locations.
  - "Vertical Asymptotes of Rational Functions" is two distinct topics (treat as part 1/part 2) with unique content.

Plan
1) Normalize and validate the dataset
   - Strip whitespace from CSV headers and values.
   - Build canonical Topic map (id → name) from Topics.csv.
   - Build hierarchy map (h-id → topic id, topic id → h-id) from Catalog.csv.
   - Detect and log conflicts:
     - Duplicate topic IDs across different h-ids.
     - Duplicate names across different IDs.
     - Missing references (edges referencing unknown IDs).
   - Decide resolution policy:
     - Keep ID as primary key; show name duplicates with disambiguating labels.
     - Allow a topic to appear in multiple hierarchy locations if needed, but surface this in UI.

2) Build the graph core (DAG-first)
   - Create adjacency indexes:
     - requires[T] = set of prereqs (incoming).
     - unlocks[T] = set of dependents (outgoing).
   - Compute per-node metadata:
     - in-degree, out-degree.
     - topo order if DAG (Kahn/DFS).
     - roots (no prereqs) and sinks (no dependents).
   - If topo order fails (cycle detected), record cycle info and surface it as a warning in UI.

3) Topological navigation mode (primary view)
   - Provide a "Topological Order" list view for the entire graph:
     - Filterable by course/unit/module.
     - Scrollable and searchable by topic name or ID.
   - If cycles exist, show a list of cycle nodes/edges and disable full topo list until resolved.

4) Local graph views to reduce clutter
   - For a selected topic X, provide:
     - Backward slice: all prerequisites up to depth k (default 2–4).
     - Forward slice: all dependents up to depth k.
     - Radius-limited neighborhood (N hops).
   - Merge repeated nodes (DAG-aware). Never duplicate a node in the same view.
   - Optional: "collapse by module" to aggregate nodes in the same module into a single cluster.

5) Metrics to summarize structure (no graph needed)
   - in-degree hotspots (many prerequisites).
   - out-degree hotspots (many dependents).
   - longest path length (critical chain depth).
   - weakly connected components (graph islands).
   - Display these as a simple dashboard panel.

6) Hierarchy-aware UX
   - Keep official curriculum hierarchy separate from prerequisites:
     - Left pane: Units → Modules → Topics (decimal numbering).
     - Right pane: DAG views for selected topic.
   - Show breadcrumb: course.unit.module.topic label.
   - For topics that appear in multiple hierarchy positions, list all placements.

7) Path views (explain "why")
   - Shortest path(s): show a minimal path from prereq to topic.
   - Critical chain: longest prerequisite chain ending at selected topic.
   - Provide a compact textual list and an optional simplified graph view.

8) Performance strategy
   - Precompute and cache:
     - in-degree/out-degree, topo order, roots/sinks.
   - On demand + memoized:
     - ancestors/descendants, shortest paths, critical chains.
   - Use BFS/DFS with visited sets to avoid cycles and repeated nodes.

9) UI feature set (minimum viable)
   - Search box with type-ahead for topics.
   - Toggle: Prereqs / Unlocks / Both.
   - Depth slider (1–6).
   - Checkbox: Collapse by module.
   - "Show paths" action for shortest path / critical chain.

Deliverables
- Data layer: normalized tables + graph indexes.
- Graph services: topo order, slices, path queries, metrics.
- UI: hierarchy tree + right-pane graph view with filters.
- Diagnostics: cycle detection + duplicate ID/name warnings.

Next Steps
- Decide resolution policy for duplicate IDs and duplicate names in production.
- Confirm whether cross-course prereq edges should be shown or filtered.
