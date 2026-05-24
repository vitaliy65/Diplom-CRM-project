"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import TopViewButtons from "@/components/buttons/TopViewButtons";
import {
  selectPaginatedStorage,
  selectStorage,
  selectStorageTotalRows,
  selectStorageCurrentPage,
  selectStorageRowsPerPage,
  setStorageCurrentPage,
  setStorageRowsPerPage,
  setFilteredStorage,
} from "@/store/slices/storage-slice";
import type { SpareParts } from "@/lib/types";
import { CreateStorageDialog } from "./CreateStorageDialog";
import ShowTablePage from "@/components/static/ShowTablePage";
import { sparePartsConfig } from "@/filters/configs/spare-parts";
import { Skeleton } from "@/components/ui/skeleton";
import TableViewBox, { TableRow } from "@/components/static/TableViewBox";
import { EditStorageDialog } from "./EditStorageDialog";

// Определяем порядок отображения столбцов склада
const STORAGE_COLUMNS: Array<keyof SpareParts> = [
  "name",
  "description",
  "count",
  "priceForOne",
];

function filterTableColumns(columns: string[]): string[] {
  return columns;
}

// Для ассоциации строки с id запчастини, как в сервисах
type TableRowWithStorageId = {
  row: TableRow[];
  storageId: string;
};

export default function StorageContainerLayout() {
  const dispatch = useAppDispatch();
  const paginatedStorage = useAppSelector(selectPaginatedStorage);
  const storage = useAppSelector(selectStorage);
  const totalRows = useAppSelector(selectStorageTotalRows);
  const currentPage = useAppSelector(selectStorageCurrentPage);
  const rowsPerPage = useAppSelector(selectStorageRowsPerPage);

  const rawHeaders = filterTableColumns(STORAGE_COLUMNS as string[]);

  // Ассоциируем данные с id для поддержки редактирования
  const data: TableRowWithStorageId[] =
    paginatedStorage?.map((item) => {
      const row: TableRow[] = rawHeaders.map((key) => ({
        text:
          item[key as keyof SpareParts] == null
            ? ""
            : String(item[key as keyof SpareParts]),
      }));
      return { row, storageId: item.id };
    }) ?? [];

  // State for editing storage dialog
  const [editingStorage, setEditingStorage] = useState<SpareParts | null>(null);
  const [saving, setSaving] = useState(false);

  // Row click sets the editingStorage for dialog
  const handleRowClick = (storageId?: string) => {
    if (!storageId) return;
    const item = storage.find((s) => s.id === storageId);
    if (item) setEditingStorage(item);
  };

  // If loading, show skeleton
  if (!storage) {
    return (
      <div className="flex h-full flex-col flex-1 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col flex-1 gap-4">
      <TopViewButtons
        ChildrenCreateDialog={<CreateStorageDialog />}
        data={storage}
        filterConfig={sparePartsConfig}
        onSort={(result) => dispatch(setFilteredStorage(result))}
      />
      <TableViewBox
        headers={rawHeaders}
        data={data.map((d) => d.row)}
        onRowClick={(idx: number) => handleRowClick(data[idx]?.storageId)}
      />
      <ShowTablePage
        totalRows={totalRows}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onChangePage={(page: number) => dispatch(setStorageCurrentPage(page))}
        onChangeRowsPerPage={(rows: number) =>
          dispatch(setStorageRowsPerPage(rows))
        }
      />
      <EditStorageDialog
        editingStorage={editingStorage}
        setEditingStorage={setEditingStorage}
        saving={saving}
      />
    </div>
  );
}
