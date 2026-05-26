import { useCallback } from "react";
import type { RootState } from "@/store";
import { exportToCsv, type ExportCsvOptions } from "@/lib/csv/exportCsv";
import { useAppSelector } from "@/store/hooks";

/**
 * Hook that reads data from a Redux slice via a selector and provides
 * a trigger function to download it as a CSV file.
 *
 * @example
 * const { exportCsv, isEmpty } = useExportCsv(
 *   (state) => state.products.items,
 *   { filename: "products", headers: { createdAt: "Created At" } }
 * );
 */
export function useExportCsv<T extends object>(
  selector: (state: RootState) => T[],
  options: ExportCsvOptions = {},
) {
  const data = useAppSelector(selector);

  const exportCsv = useCallback(() => {
    exportToCsv(data, options);
  }, [data, options]);

  return {
    exportCsv,
    isEmpty: data.length === 0,
  };
}
