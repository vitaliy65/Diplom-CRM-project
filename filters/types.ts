// ─── Operators ───────────────────────────────────────────────────────────────

export type FilterOperator =
  | "eq"
  | "neq"
  | "contains"
  | "in"
  | "gte"
  | "lte"
  | "between"
  | "boolean";

// ─── Field descriptor ────────────────────────────────────────────────────────

export type FilterFieldType =
  | "text"
  | "select"
  | "multi-select"
  | "boolean"
  | "number-range"
  | "date-range";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterFieldConfig<T> {
  field: keyof T;
  label: string;
  type: FilterFieldType;
  /** Required for select / multi-select */
  options?: FilterOption[];
  /** Default operator; can be overridden per active filter */
  operator: FilterOperator;
}

export interface SortFieldConfig<T> {
  field: keyof T;
  label: string;
}

// ─── Entity config (one file per entity) ─────────────────────────────────────

export interface EntityFilterSortConfig<T> {
  filters: FilterFieldConfig<T>[];
  sorts: SortFieldConfig<T>[];
  defaultSort?: {
    field: keyof T;
    direction: SortDirection;
  };
}

// ─── Active state ─────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export interface ActiveFilter<T> {
  field: keyof T;
  value: unknown;
  operator: FilterOperator;
}

export interface ActiveSort<T> {
  field: keyof T;
  direction: SortDirection;
}

export interface FilterSortState<T> {
  filters: ActiveFilter<T>[];
  sort: ActiveSort<T> | null;
}
