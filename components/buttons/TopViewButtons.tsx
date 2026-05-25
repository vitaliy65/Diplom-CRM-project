import { ReactNode, useEffect, useCallback, useMemo, useState } from "react";
import ExportButton from "./ExportButton";
import SearchBox from "@/components/static/SearchBox";
import DividerVertical from "@/components/static/DividerVertical";
import { EntityFilterSortConfig, useFilterSort } from "@/filters";
import { FilterPanel } from "@/components/panels/Filterpanel";
import { SortPanel } from "@/components/panels/Sortpanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { SoapDispenserDroplet } from "lucide-react";

interface TopViewButtonsI<T> {
  ChildrenCreateDialog: ReactNode;
  data: T[];
  filterConfig: EntityFilterSortConfig<T>;
  onSort: (result: T[]) => void;
}

export default function TopViewButtons<T>({
  ChildrenCreateDialog,
  data,
  filterConfig,
  onSort,
}: TopViewButtonsI<T>) {
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState("");

  const { result, state, setFilter, setSort, clearSort, clearFilters } =
    useFilterSort<T>(data, filterConfig);

  const searchableFields = useMemo(
    () =>
      filterConfig.filters
        .filter(
          (f) =>
            f.type === "text" ||
            f.type === "select" ||
            f.type === "multi-select",
        )
        .map((f) => f.field),
    [filterConfig.filters],
  );

  const displayResult = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return result;

    const loweredQuery = trimmed.toLowerCase();
    return result.filter((item) =>
      searchableFields.some((field) => {
        const value = (item as Record<string, unknown>)[field as string];
        if (value === null || value === undefined) return false;
        if (Array.isArray(value)) {
          return value
            .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
            .some((v) => v.toLowerCase().includes(loweredQuery));
        }
        if (typeof value === "boolean") {
          return (value ? "true" : "false")
            .toLowerCase()
            .includes(loweredQuery);
        }
        return String(value).toLowerCase().includes(loweredQuery);
      }),
    );
  }, [result, searchQuery, searchableFields]);

  useEffect(() => {
    onSort(displayResult);
  }, [displayResult, onSort]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        clearFilters();
      }
    },
    [clearFilters],
  );

  return (
    <div className="flex h-fit justify-between max-md:flex-col max-md:gap-4">
      <div className="flex w-full h-fit gap-4 max-md:flex-col">
        <SearchBox onSearch={handleSearch} />
        <div className="flex gap-4 max-md:gap-2 md:justify-between w-full">
          <div className="flex gap-4 max-md:gap-2">
            {!isMobile && <DividerVertical />}
            <FilterPanel
              config={filterConfig}
              activeFilters={state.filters}
              onSetFilter={setFilter}
              onClearFilters={clearFilters}
            />
            <SortPanel
              config={filterConfig}
              activeSort={state.sort}
              onSetSort={setSort}
              onClearSort={clearSort}
            />
          </div>
          <div className="flex w-fit h-full gap-4 max-md:gap-2">
            <ExportButton />
            {ChildrenCreateDialog}
          </div>
        </div>
      </div>
    </div>
  );
}
