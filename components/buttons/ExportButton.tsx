import { DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportCsv } from "@/hooks/useExportCsv";
import type { RootState } from "@/store";
import type { ExportCsvOptions } from "@/lib/csv/exportCsv";

interface ExportButtonProps<T extends object> {
  selector: (state: RootState) => T[];
  options?: ExportCsvOptions;
}

export default function ExportButton<T extends object>({
  selector,
  options,
}: ExportButtonProps<T>) {
  const { exportCsv, isEmpty } = useExportCsv(selector, options);

  return (
    <Button
      className="button-el"
      onClick={exportCsv}
      disabled={isEmpty}
      aria-label="Export to CSV"
    >
      <DownloadCloud />
      Export
    </Button>
  );
}
