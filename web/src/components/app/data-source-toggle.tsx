"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Switch } from "@/components/ui/switch";
import {
  buildSearchParamsWithSource,
  type GraphSource,
} from "@/lib/data-source";

type DataSourceToggleProps = {
  dataSource: GraphSource;
};

export function DataSourceToggle({ dataSource }: DataSourceToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const switchId = React.useId();
  const isEce = dataSource === "ece";

  const handleToggle = React.useCallback(
    (checked: boolean) => {
      const nextSource: GraphSource = checked ? "ece" : "default";
      const currentParams = new URLSearchParams(searchParams?.toString());
      const nextParams = buildSearchParamsWithSource(currentParams, nextSource);
      const query = nextParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={switchId}
        className={
          isEce
            ? "text-xs font-medium text-[color:var(--tangle-yellow)]"
            : "text-xs text-muted-foreground"
        }
      >
        ECE
      </label>
      <Switch
        id={switchId}
        checked={isEce}
        onCheckedChange={handleToggle}
        aria-label="Toggle ECE data source"
        className="data-[state=checked]:bg-[var(--tangle-yellow)]"
      />
    </div>
  );
}
