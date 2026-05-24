import { ActiveFilter, ActiveSort, FilterOperator } from "./types";

// ─── Single item filter check ─────────────────────────────────────────────────

function matchesFilter<T>(item: T, filter: ActiveFilter<T>): boolean {
  const raw = item[filter.field];

  switch (filter.operator as FilterOperator) {
    case "eq":
      return raw === filter.value;

    case "neq":
      return raw !== filter.value;

    case "contains":
      return String(raw ?? "")
        .toLowerCase()
        .includes(String(filter.value).toLowerCase());

    case "in": {
      const list = filter.value as unknown[];
      return list.length === 0 || list.includes(raw);
    }

    case "boolean":
      return raw === filter.value;

    case "gte":
      return Number(raw) >= Number(filter.value);

    case "lte":
      return Number(raw) <= Number(filter.value);

    case "between": {
      const [min, max] = filter.value as [number, number];
      const n = Number(raw);
      return n >= min && n <= max;
    }

    default:
      return true;
  }
}

// ─── Apply all filters + sort ─────────────────────────────────────────────────

export function applyFilterSort<T>(
  data: T[],
  filters: ActiveFilter<T>[],
  sort: ActiveSort<T> | null,
): T[] {
  // Filter
  const filtered = data.filter((item) =>
    filters.every((f) => matchesFilter(item, f)),
  );

  // Sort
  if (!sort) return filtered;

  const { field, direction } = sort;

  return [...filtered].sort((a, b) => {
    const av = a[field];
    const bv = b[field];

    // Numeric
    if (typeof av === "number" && typeof bv === "number") {
      return direction === "asc" ? av - bv : bv - av;
    }

    // Date strings (ISO)
    const da = Date.parse(String(av));
    const db = Date.parse(String(bv));
    if (!isNaN(da) && !isNaN(db)) {
      return direction === "asc" ? da - db : db - da;
    }

    // Fallback: string locale compare
    const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
      numeric: true,
    });
    return direction === "asc" ? cmp : -cmp;
  });
}
