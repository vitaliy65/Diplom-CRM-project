import { ReactNode, useEffect } from "react";
import ExportButton from "./ExportButton";
import SearchBox from "@/components/static/SearchBox";
import DividerVertical from "@/components/static/DividerVertical";
import { EntityFilterSortConfig, useFilterSort } from "@/filters";
import { FilterPanel } from "@/components/panels/Filterpanel";
import { SortPanel } from "@/components/panels/Sortpanel";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const { result, state, setFilter, setSort, clearSort, clearFilters } =
    useFilterSort<T>(data, filterConfig);

  useEffect(() => {
    onSort(result);
  }, [result]);

  return (
    <div className="flex h-fit justify-between max-md:flex-col max-md:gap-4">
      <div className="flex w-full h-fit gap-4 max-md:flex-col">
        <SearchBox />
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
