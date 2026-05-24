"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, SortAscIcon } from "lucide-react";
import {
  EntityFilterSortConfig,
  ActiveSort,
  SortDirection,
} from "@/filters/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface SortPanelProps<T> {
  config: EntityFilterSortConfig<T>;
  activeSort: ActiveSort<T> | null;
  onSetSort: (field: keyof T, direction: SortDirection) => void;
  onClearSort: () => void;
}

const DIRECTION_LABELS: Record<SortDirection, string> = {
  asc: "За зростанням",
  desc: "За спаданням",
};

export function SortPanel<T>({
  config,
  activeSort,
  onSetSort,
  onClearSort,
}: SortPanelProps<T>) {
  const isMobile = useIsMobile();
  const hasSort = !!activeSort;

  function handleFieldClick(field: keyof T) {
    if (activeSort?.field === field) {
      // Cycle: asc → desc → clear
      if (activeSort.direction === "asc") {
        onSetSort(field, "desc");
      } else {
        onClearSort();
      }
    } else {
      onSetSort(field, "asc");
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="button-el">
          <SortAscIcon />
          {!isMobile && (
            <>
              <span>
                {hasSort
                  ? config.sorts.find((s) => s.field === activeSort.field)
                      ?.label
                  : "Сортування"}
              </span>
              {hasSort && (
                <span className="ml-0.5">
                  {activeSort.direction === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                </span>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 p-0 shadow-2xl bg-card"
        align="center"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Сортування</span>
          {hasSort && (
            <button
              type="button"
              onClick={onClearSort}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Скинути
            </button>
          )}
        </div>

        {/* Sort options */}
        <div className="py-1">
          {config.sorts.map((sortCfg) => {
            const isActive = activeSort?.field === sortCfg.field;
            const direction = isActive ? activeSort.direction : null;

            return (
              <button
                key={String(sortCfg.field)}
                type="button"
                onClick={() => handleFieldClick(sortCfg.field)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted border-b border-border ${
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <span>{sortCfg.label}</span>
                <span className="flex items-center gap-1 text-xs">
                  {isActive && (
                    <>
                      <span className="text-primary">
                        {DIRECTION_LABELS[direction!]}
                      </span>
                      {direction === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-primary" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-primary" />
                      )}
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Direction hint */}
        {hasSort && (
          <div className="px-4 py-2">
            <p className="text-xs text-muted-foreground">
              Натисніть знову щоб змінити напрямок, ще раз — скинути
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
