"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ActiveFilter,
  ActiveSort,
  EntityFilterSortConfig,
  FilterOperator,
  FilterSortState,
  SortDirection,
} from "@/filters/types";
import { applyFilterSort } from "@/filters/applyFilterSort";

interface UseFilterSortReturn<T> {
  /** Filtered + sorted result — use this as your data source */
  result: T[];
  state: FilterSortState<T>;
  /** Set or update a single field filter */
  setFilter: (
    field: keyof T,
    value: unknown,
    operator?: FilterOperator,
  ) => void;
  /** Remove a specific field filter */
  removeFilter: (field: keyof T) => void;
  /** Replace sort; pass null to clear */
  setSort: (field: keyof T, direction: SortDirection) => void;
  clearSort: () => void;
  clearFilters: () => void;
  resetAll: () => void;
  activeFilterCount: number;
  hasActiveSort: boolean;
}

export function useFilterSort<T>(
  data: T[],
  config: EntityFilterSortConfig<T>,
): UseFilterSortReturn<T> {
  const initialState: FilterSortState<T> = {
    filters: [],
    sort: config.defaultSort
      ? {
          field: config.defaultSort.field,
          direction: config.defaultSort.direction,
        }
      : null,
  };

  const [state, setState] = useState<FilterSortState<T>>(initialState);

  // ── Setters ──────────────────────────────────────────────────────────────

  const setFilter = useCallback(
    (field: keyof T, value: unknown, operator?: FilterOperator) => {
      // Resolve operator: argument → config default → "eq"
      const configField = config.filters.find((f) => f.field === field);
      const resolvedOperator: FilterOperator =
        operator ?? configField?.operator ?? "eq";

      setState((prev) => {
        // Clearing: empty string / null / empty array
        const isEmpty =
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          return {
            ...prev,
            filters: prev.filters.filter((f) => f.field !== field),
          };
        }

        const next: ActiveFilter<T> = {
          field,
          value,
          operator: resolvedOperator,
        };
        const idx = prev.filters.findIndex((f) => f.field === field);

        if (idx >= 0) {
          const updated = [...prev.filters];
          updated[idx] = next;
          return { ...prev, filters: updated };
        }

        return { ...prev, filters: [...prev.filters, next] };
      });
    },
    [config.filters],
  );

  const removeFilter = useCallback((field: keyof T) => {
    setState((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f.field !== field),
    }));
  }, []);

  const setSort = useCallback((field: keyof T, direction: SortDirection) => {
    setState((prev) => ({ ...prev, sort: { field, direction } }));
  }, []);

  const clearSort = useCallback(() => {
    setState((prev) => ({ ...prev, sort: null }));
  }, []);

  const clearFilters = useCallback(() => {
    setState((prev) => ({ ...prev, filters: [] }));
  }, []);

  const resetAll = useCallback(() => {
    setState(initialState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────

  const result = useMemo(
    () => applyFilterSort(data, state.filters, state.sort),
    [data, state.filters, state.sort],
  );

  return {
    result,
    state,
    setFilter,
    removeFilter,
    setSort,
    clearSort,
    clearFilters,
    resetAll,
    activeFilterCount: state.filters.length,
    hasActiveSort: !!state.sort,
  };
}
