"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { filterTopicSearchItems } from "@/lib/topic-search";
import type { TopicSearchItem } from "@/lib/topic-search";

type TopicSearchProps = {
  items: TopicSearchItem[];
  selectedTopicId: number | null;
};

const RESULT_LIMIT = 8;
const EMPTY_RESULTS: TopicSearchItem[] = [];

const isMacPlatform = (): boolean =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export function TopicSearch({ items, selectedTopicId }: TopicSearchProps) {
  const [query, setQuery] = React.useState("");
  const [isMac, setIsMac] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setIsMac(isMacPlatform());
  }, []);

  const results = React.useMemo(() => {
    if (!query.trim()) {
      return EMPTY_RESULTS;
    }
    return filterTopicSearchItems(items, query, RESULT_LIMIT);
  }, [items, query]);

  const handleSelect = React.useCallback(
    (topicId: number) => {
      router.push(`/?topic=${topicId}`);
      setQuery("");
    },
    [router]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && results[0]) {
      event.preventDefault();
      handleSelect(results[0].id);
    }
    if (event.key === "Escape") {
      setQuery("");
      event.currentTarget.blur();
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <SidebarInput
          placeholder="Search topics by name or ID"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <KbdGroup className="shrink-0">
          <Kbd>{isMac ? "Cmd" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
      {query.trim().length ? (
        <SidebarMenu>
          {results.length ? (
            results.map((topic) => (
              <SidebarMenuItem key={topic.id}>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  isActive={topic.id === selectedTopicId}
                  className="h-auto w-full flex-col items-start gap-1 py-2"
                >
                  <Link href={`/?topic=${topic.id}`} onClick={() => setQuery("")}>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      ID {topic.id}
                      {topic.placements[0] ? ` - ${topic.placements[0]}` : ""}
                    </span>
                    <span className="truncate text-sm font-medium">{topic.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          ) : (
            <SidebarMenuItem>
              <div className="px-2 py-1 text-xs text-muted-foreground">
                No matches yet.
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      ) : null}
    </div>
  );
}
