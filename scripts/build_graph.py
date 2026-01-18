#!/usr/bin/env python3
from __future__ import annotations

import csv
import os
import heapq
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR_ENV = os.environ.get("GRAPH_DATA_DIR")
DATA_DIR = Path(DATA_DIR_ENV) if DATA_DIR_ENV else BASE_DIR / "DATA"
OUTPUT_PATH = DATA_DIR / "graph.json"


def read_csv(path: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    with path.open(newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if not row:
                continue
            cleaned: dict[str, str] = {}
            for key, value in row.items():
                if key is None:
                    continue
                key = key.strip()
                if isinstance(value, str):
                    value = value.strip()
                cleaned[key] = value
            if cleaned:
                rows.append(cleaned)
    return rows


def parse_id(value: str) -> tuple[int, ...]:
    return tuple(int(part) for part in value.split("."))


def parse_hid(value: str) -> tuple[int, int, int, int]:
    parts = value.split(".")
    if len(parts) != 4:
        raise ValueError(f"Invalid h-id: {value}")
    return tuple(int(part) for part in parts)  # type: ignore[return-value]


def main() -> None:
    courses_path = DATA_DIR / "Courses.csv"
    units_path = DATA_DIR / "Units.csv"
    modules_path = DATA_DIR / "Modules.csv"
    topics_path = DATA_DIR / "Topics.csv"
    catalog_path = DATA_DIR / "Catalog.csv"
    prereq_path = DATA_DIR / "Prerequisites.csv"

    courses: dict[str, dict[str, object]] = {}
    for row in read_csv(courses_path):
        course_id = row.get("course-id")
        if not course_id:
            continue
        courses[course_id] = {"name": row.get("course-name", ""), "units": []}

    units: dict[str, dict[str, object]] = {}
    for row in read_csv(units_path):
        unit_id = row.get("unit-id")
        if not unit_id:
            continue
        units[unit_id] = {
            "name": row.get("unit-name", ""),
            "course_id": unit_id.split(".")[0],
            "modules": [],
        }

    modules: dict[str, dict[str, object]] = {}
    for row in read_csv(modules_path):
        module_id = row.get("module-id")
        if not module_id:
            continue
        unit_id = ".".join(module_id.split(".")[:2])
        modules[module_id] = {
            "name": row.get("module-name", ""),
            "unit_id": unit_id,
            "topics": [],
            "topic_hids": [],
        }

    topics: dict[int, dict[str, object]] = {}
    name_to_ids: defaultdict[str, list[int]] = defaultdict(list)
    for row in read_csv(topics_path):
        topic_id = row.get("id")
        if not topic_id:
            continue
        topic_int = int(topic_id)
        name = row.get("name", "")
        topics[topic_int] = {"name": name, "placements": []}
        name_to_ids[name].append(topic_int)

    topic_ids = set(topics.keys())

    hid_to_topic: dict[str, int] = {}
    topic_to_hids: defaultdict[int, list[str]] = defaultdict(list)
    module_topics: defaultdict[str, list[tuple[int, int, str]]] = defaultdict(list)
    catalog_rows = 0
    for row in read_csv(catalog_path):
        topic_id = row.get("id")
        hid = row.get("h-id")
        if not topic_id or not hid:
            continue
        topic_int = int(topic_id)
        catalog_rows += 1
        topic_ids.add(topic_int)
        hid_to_topic[hid] = topic_int
        topic_to_hids[topic_int].append(hid)
        if topic_int not in topics:
            topics[topic_int] = {"name": row.get("topic", ""), "placements": []}
        topics[topic_int]["placements"].append(hid)
        course_id, unit_index, module_index, topic_index = parse_hid(hid)
        module_id = f"{course_id}.{unit_index}.{module_index}"
        if module_id not in modules:
            unit_id = f"{course_id}.{unit_index}"
            modules[module_id] = {
                "name": "",
                "unit_id": unit_id,
                "topics": [],
                "topic_hids": [],
            }
        module_topics[module_id].append((topic_index, topic_int, hid))

    for module_id, entries in module_topics.items():
        entries.sort(key=lambda item: (item[0], item[1]))
        modules[module_id]["topics"] = [topic_id for _, topic_id, _ in entries]
        modules[module_id]["topic_hids"] = [hid for _, _, hid in entries]

    modules_by_unit: defaultdict[str, list[str]] = defaultdict(list)
    for module_id, module in modules.items():
        unit_id = module["unit_id"]
        modules_by_unit[unit_id].append(module_id)

    for unit_id, unit in units.items():
        unit["modules"] = sorted(modules_by_unit.get(unit_id, []), key=parse_id)

    units_by_course: defaultdict[str, list[str]] = defaultdict(list)
    for unit_id, unit in units.items():
        units_by_course[unit["course_id"]].append(unit_id)

    for course_id, course in courses.items():
        course["units"] = sorted(units_by_course.get(course_id, []), key=parse_id)

    edges: list[tuple[int, int]] = []
    for row in read_csv(prereq_path):
        topic_id = row.get("topic")
        prereq_id = row.get("requires")
        if not topic_id or not prereq_id:
            continue
        topic_int = int(topic_id)
        prereq_int = int(prereq_id)
        edges.append((topic_int, prereq_int))
        topic_ids.add(topic_int)
        topic_ids.add(prereq_int)
        if topic_int not in topics:
            topics[topic_int] = {"name": "", "placements": []}
        if prereq_int not in topics:
            topics[prereq_int] = {"name": "", "placements": []}

    topic_ids_sorted = sorted(topic_ids)
    requires: dict[int, list[int]] = {topic_id: [] for topic_id in topic_ids_sorted}
    unlocks: dict[int, list[int]] = {topic_id: [] for topic_id in topic_ids_sorted}
    for topic_id, prereq_id in edges:
        requires[topic_id].append(prereq_id)
        unlocks[prereq_id].append(topic_id)

    for topic_id in topic_ids_sorted:
        requires[topic_id].sort()
        unlocks[topic_id].sort()

    in_degree = {topic_id: len(requires[topic_id]) for topic_id in topic_ids_sorted}
    out_degree = {topic_id: len(unlocks[topic_id]) for topic_id in topic_ids_sorted}
    roots = [topic_id for topic_id, degree in in_degree.items() if degree == 0]
    sinks = [topic_id for topic_id, degree in out_degree.items() if degree == 0]
    roots.sort()
    sinks.sort()

    temp_in = dict(in_degree)
    heap = [topic_id for topic_id, degree in temp_in.items() if degree == 0]
    heapq.heapify(heap)
    topo_order: list[int] = []
    while heap:
        topic_id = heapq.heappop(heap)
        topo_order.append(topic_id)
        for dependent_id in unlocks.get(topic_id, []):
            temp_in[dependent_id] -= 1
            if temp_in[dependent_id] == 0:
                heapq.heappush(heap, dependent_id)

    has_cycle = len(topo_order) != len(topic_ids_sorted)
    cycle_nodes = sorted(
        [topic_id for topic_id, degree in temp_in.items() if degree > 0]
    )

    duplicate_topic_names = {
        name: sorted(ids) for name, ids in name_to_ids.items() if len(ids) > 1
    }
    duplicate_topic_ids = {
        str(topic_id): sorted(hids, key=parse_hid)
        for topic_id, hids in topic_to_hids.items()
        if len(hids) > 1
    }

    for topic_id, data in topics.items():
        placements = data.get("placements", [])
        if placements:
            data["placements"] = sorted(placements, key=parse_hid)

    graph = {
        "version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "stats": {
            "topics": len(topics),
            "catalog_rows": catalog_rows,
            "edges": len(edges),
            "roots": len(roots),
            "sinks": len(sinks),
            "has_cycle": has_cycle,
        },
        "courses": courses,
        "units": units,
        "modules": modules,
        "topics": {
            "by_id": {str(topic_id): data for topic_id, data in topics.items()},
            "ordered_ids": topic_ids_sorted,
        },
        "catalog": {
            "hid_to_topic": {hid: topic_id for hid, topic_id in hid_to_topic.items()},
            "topic_to_hids": {
                str(topic_id): sorted(hids, key=parse_hid)
                for topic_id, hids in topic_to_hids.items()
            },
        },
        "graph": {
            "requires": {
                str(topic_id): requires[topic_id] for topic_id in topic_ids_sorted
            },
            "unlocks": {
                str(topic_id): unlocks[topic_id] for topic_id in topic_ids_sorted
            },
            "in_degree": {
                str(topic_id): in_degree[topic_id] for topic_id in topic_ids_sorted
            },
            "out_degree": {
                str(topic_id): out_degree[topic_id] for topic_id in topic_ids_sorted
            },
            "roots": roots,
            "sinks": sinks,
            "topo_order": topo_order,
            "cycle_nodes": cycle_nodes,
        },
        "duplicates": {
            "topic_names": duplicate_topic_names,
            "topic_ids": duplicate_topic_ids,
        },
    }

    OUTPUT_PATH.write_text(
        json.dumps(graph, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
