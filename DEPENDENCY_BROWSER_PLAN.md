Math Academy Dependency Browser Plan

Goal
Build a local, hierarchy-aware browser for Math Academy topic prerequisites in Next.js using shadcn components, with topo navigation and local dependency views.

What We Know From the Data
- 3 courses (Mathematical Foundations I-III), 42 units, 149 modules, 1025 unique topics.
- Catalog hierarchy uses decimal IDs: course.unit.module.topic (e.g., 1.1.1.1).
- Topics list (Topics.csv) is the canonical ID -> name map.
- Prerequisites.csv is an edge list of topic -> requires.
- DATA/graph.json contains the derived graph indexes and hierarchy maps.

Domain notes:
  - Topic ID 1060 is intentionally shared across MF2 and MF3 as the same topic placed in two locations.
  - "Vertical Asymptotes of Rational Functions" is two distinct topics (treat as part 1/part 2) with unique content.

Completed
- Normalized CSV inputs and generated DATA/graph.json with adjacency indexes, degree stats, topo order, roots/sinks, and duplicate markers.
- Renamed Requires.csv to Prerequisites.csv and removed Unlocks.csv.

Plan (UI stages, tangled tree deferred)
1) App scaffold + styling (Next.js + shadcn)
   - Create Next.js app (App Router, TypeScript, Tailwind).
   - Install shadcn components: sidebar, breadcrumb, command, card, toggle-group, drawer, hover-card, kbd.
   - Build the basic layout shell (sidebar + main pane) and responsive behavior.

2) Data access and app state
   - Load DATA/graph.json server-side and expose typed selectors/helpers.
   - Client state for selected topic, view mode, depth, collapse-by-module, search query.
   - Include duplicate-name/id indicators and cycle warnings in the data model.

3) Hierarchy navigation + topic detail
   - Left pane tree: courses -> units -> modules -> topics (decimal numbering).
   - Breadcrumb for selected topic.
   - Topic detail card: name, id, placements, prereq/unlock counts.

4) Search + command palette
   - Type-ahead search box and Command palette (Cmd/Ctrl+K).
   - Kbd hints for shortcuts; results jump to topic.

5) Topological navigation view (primary list)
   - Provide a "Topological Order" list view for the entire graph:
     - Filterable by course/unit/module.
     - Scrollable and searchable by topic name or ID.
   - If cycles exist, show a list of cycle nodes and disable full topo list until resolved.

6) Local dependency views (list-based for now)
   - For a selected topic X, provide:
     - Backward slice: all prerequisites up to depth k (default 2-4).
     - Forward slice: all dependents up to depth k.
     - Radius-limited neighborhood (N hops).
   - Merge repeated nodes (DAG-aware). Never duplicate a node in the same view.
   - Toggle: Prereqs / Unlocks / Both (Toggle Group).
   - Depth slider (1-6) and collapse-by-module checkbox.
   - Hover Card previews for topics.

7) Metrics to summarize structure (no graph needed)
   - in-degree hotspots (many prerequisites).
   - out-degree hotspots (many dependents).
   - longest path length (critical chain depth).
   - weakly connected components (graph islands).
   - Display these as a simple dashboard panel (Cards).

8) Path views (explain "why")
   - Shortest path(s): show a minimal path from prereq to topic.
   - Critical chain: longest prerequisite chain ending at selected topic.
   - Provide a compact textual list; use a Drawer for results.

9) Performance strategy
   - Precompute and cache:
     - in-degree/out-degree, topo order, roots/sinks.
   - On demand + memoized:
     - ancestors/descendants, shortest paths, critical chains.
   - Use BFS/DFS with visited sets to avoid cycles and repeated nodes.

Deliverables (remaining)
- UI shell + hierarchy tree.
- Topological list view.
- Local dependency list views.
- Metrics + path views.
- Diagnostics: cycle detection + duplicate ID/name warnings.

Next Steps
- Scaffold Next.js + shadcn components.
- Wire DATA/graph.json into the app data layer.
