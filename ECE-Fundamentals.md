# Plan: ECE Fundamentals Course Overlay

## Goal
Create a new "ECE Fundamentals" course view whose zenith topics are the items listed in `STUDY/ECE-81.md`, without modifying or polluting the existing course/graph data. The view should include all prerequisite topics upstream of those zenith topics and support a per-topic "completed" state for progress tracking.

## Constraints
- Do not edit or extend the existing CSV sources in `DATA/`.
- Keep `DATA/graph.json` as the canonical base graph for the three Math Foundations courses.
- Treat "ECE Fundamentals" as a separate overlay that references existing topic IDs.

## Proposed Data Model (Overlay)
1. **ECE targets file** (manual mapping, versioned in repo)
   - Path: `DATA/overlays/ece_fundamentals_targets.json`
   - Contents: list of target topic IDs (zenith topics) and optional notes.
   - Example schema:
     ```json
     {
       "name": "ECE Fundamentals",
       "source": "STUDY/ECE-81.md",
       "targets": [
         { "topic_id": 1234, "label": "11.37 Factoring Polynomials" }
       ]
     }
     ```

2. **ECE subgraph file** (generated)
   - Path: `DATA/overlays/ece_fundamentals_graph.json`
   - Contents: subgraph induced by all prerequisites of the target topics.
   - Keep the same structure as `DATA/graph.json`, but only include the subset of topics, edges, and related metadata plus a list of target IDs.

3. **Progress file** (user state)
   - Path: `DATA/progress/ece_fundamentals_progress.json`
   - Contents: topic completion state keyed by topic ID.
   - Example schema:
     ```json
     {
       "version": 1,
       "course": "ECE Fundamentals",
       "updated_at": "2025-01-01T00:00:00Z",
       "completed": {
         "1234": { "status": "done", "completed_at": "2025-01-01T00:00:00Z" },
         "5678": { "status": "in_progress" }
       }
     }
     ```

## Implementation Plan
1. **Map ECE-81 topics to existing topic IDs**
   - Parse `STUDY/ECE-81.md` into a structured list (module title + topic name).
   - Write a small mapping helper (script or notebook) to match ECE-81 entries against `DATA/graph.json`:
     - Use topic names first.
     - Use placements (`hid`) if the ECE numbering aligns with existing `h-id` values.
     - Handle duplicates (see `duplicates` in `DATA/graph.json`) with explicit ID selection.
   - Output `DATA/overlays/ece_fundamentals_targets.json` with verified topic IDs.

2. **Generate the ECE subgraph**
   - Add a script (e.g., `scripts/build_ece_overlay.py`) that:
     - Loads `DATA/graph.json` and the targets file.
     - For each target topic ID, computes the full prerequisite closure using `graph.requires`.
     - Collects all included topics and edges to build a subgraph.
     - Writes `DATA/overlays/ece_fundamentals_graph.json`.
   - This keeps the base graph untouched while giving a dedicated ECE view.

3. **Integrate overlay loading in the app**
   - Extend `web/src/lib/graph.ts` to support loading an overlay graph by name, or add a separate `getOverlayGraph("ece_fundamentals")`.
   - Add a UI toggle/selector for "ECE Fundamentals" that uses the overlay data instead of the base graph.
   - Ensure topic labels still use base `topics.by_id` data from the overlay graph (same structure as base).

4. **Add completion state support**
   - Add a lightweight data layer to read/write `DATA/progress/ece_fundamentals_progress.json`.
   - In the UI, overlay completion status on nodes and add a control to mark topics as done/in progress.
   - Keep this state separate from graph data to avoid polluting any course definitions.

5. **Validation and maintenance**
   - Add a sanity check in the overlay build script:
     - Ensure all target IDs exist in the base graph.
     - Warn on any missing/ambiguous matches.
   - Rerun overlay build when `DATA/graph.json` or `ece_fundamentals_targets.json` changes.

## Milestones
1. Produce a clean targets file from `STUDY/ECE-81.md` with verified topic IDs.
2. Generate `ece_fundamentals_graph.json` and confirm the subgraph is correct.
3. Add overlay selection in the UI and confirm the ECE view renders.
4. Add completion state read/write and a visible progress indicator.

## Notes
- This design uses only new overlay and progress files, preserving the existing curriculum data as-is.
- If you later want multiple custom courses, you can follow the same overlay pattern.
