import Papa from "papaparse";

function serializeValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((v) =>
        v !== null && typeof v === "object" ? JSON.stringify(v) : String(v),
      )
      .join("; ");
  }
  if (typeof value === "object" && !(value instanceof Date)) {
    return JSON.stringify(value);
  }
  return String(value);
}

function flattenRecord(
  record: Record<string, unknown>,
): Record<string, string> {
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(record)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      for (const [nestedKey, nestedValue] of Object.entries(
        value as Record<string, unknown>,
      )) {
        flat[`${key}.${nestedKey}`] = serializeValue(nestedValue);
      }
    } else {
      flat[key] = serializeValue(value);
    }
  }

  return flat;
}

export interface ExportCsvOptions {
  /** File name without extension. Defaults to "export". */
  filename?: string;
  /**
   * Fields to hide from the export (raw field names, including flattened e.g. "address.city").
   * New fields added to the slice appear automatically unless listed here.
   */
  excludeColumns?: string[];
  /**
   * Partial map of raw field name → display label.
   * Unmapped fields are exported with their raw name.
   */
  headers?: Partial<Record<string, string>>;
}

export function exportToCsv<T extends object>(
  data: T[],
  options: ExportCsvOptions = {},
): void {
  if (!data.length) return;

  const { filename = "export", excludeColumns = [], headers = {} } = options;

  const flatData = data.map((item) =>
    flattenRecord(item as Record<string, unknown>),
  );

  // Collect all keys across all rows (handles sparse data), then exclude.
  const allKeys = Array.from(
    flatData.reduce<Set<string>>((acc, row) => {
      Object.keys(row).forEach((k) => acc.add(k));
      return acc;
    }, new Set()),
  );

  const fields = allKeys.filter((k) => !excludeColumns.includes(k));

  const displayColumns = fields.map((f) => headers[f] ?? f);

  const rows = flatData.map((row) =>
    Object.fromEntries(
      fields.map((field, i) => [displayColumns[i], row[field] ?? ""]),
    ),
  );

  const csv = Papa.unparse(rows, { columns: displayColumns, delimiter: ";" });

  // UTF-8 BOM — required for Excel to correctly display Cyrillic and other non-ASCII
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
