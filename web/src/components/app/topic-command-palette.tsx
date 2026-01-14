"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import type { TopicSearchItem } from "@/lib/topic-search";
import { filterTopicSearchItems } from "@/lib/topic-search";
import { cn } from "@/lib/utils";

type TopicCommandPaletteProps = {
  items: TopicSearchItem[];
  selectedTopicId: number | null;
};

const RESULT_LIMIT = 60;

export function TopicCommandPalette({
  items,
  selectedTopicId,
}: TopicCommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const results = React.useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return filterTopicSearchItems(items, query, RESULT_LIMIT);
  }, [items, query]);

  React.useEffect(() => {
    if (results.length) {
      setSelectedValue(String(results[0].id));
    } else {
      setSelectedValue("");
    }
  }, [results]);

  const handleSelect = React.useCallback(
    (value: string) => {
      const nextId = Number(value);
      if (!Number.isNaN(nextId)) {
        router.push(`/?topic=${nextId}`);
        setOpen(false);
      }
    },
    [router]
  );

  const emptyMessage = query.trim()
    ? "No topics found."
    : "Type to search topics.";

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Topic Search"
      description="Find a topic by name or ID."
      commandProps={{
        value: selectedValue,
        onValueChange: setSelectedValue,
        shouldFilter: false,
      }}
    >
      <CommandInput
        placeholder="Search topics by name, ID, or placement..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup heading="Topics">
          {results.map((item) => (
            <CommandItem
              key={item.id}
              value={String(item.id)}
              keywords={[item.label, item.name, ...item.placements]}
              onSelect={handleSelect}
              className={cn(
                "flex items-start gap-3",
                selectedTopicId === item.id && "bg-muted/60"
              )}
            >
              <div className="text-xs text-muted-foreground tabular-nums">
                {item.id}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.placements[0] ? item.placements[0] : "No placement recorded"}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
