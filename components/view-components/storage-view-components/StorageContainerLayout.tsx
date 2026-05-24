"use client";

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
import { sparePartsConfig } from "@/filters/configs/spare-parts"; // Assume you have a storageConfig or add your own filter config.
import { Skeleton } from "@/components/ui/skeleton";
import TableViewBox from "@/components/static/TableViewBox";

// Статичный порядок отображения полей (ключей склада) в таблице
const STORAGE_COLUMNS: Array<keyof SpareParts> = [
  "name",
  "description",
  "count",
  "priceForOne",
];

function filterTableColumns(columns: string[]): string[] {
  return columns;
}

export default function StorageContainerLayout() {
  const dispatch = useAppDispatch();
  const paginatedStorage = useAppSelector(selectPaginatedStorage);
  const storage = useAppSelector(selectStorage);
  const totalRows = useAppSelector(selectStorageTotalRows);
  const currentPage = useAppSelector(selectStorageCurrentPage);
  const rowsPerPage = useAppSelector(selectStorageRowsPerPage);

  const rawHeaders = filterTableColumns(STORAGE_COLUMNS as string[]);

  const data =
    paginatedStorage?.map((item) => {
      const row: TableRow[] = rawHeaders.map((key) => ({
        text:
          item[key as keyof SpareParts] == null
            ? ""
            : String(item[key as keyof SpareParts]),
      }));
      return row;
    }) ?? [];

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
      <TableViewBox headers={rawHeaders} data={data} />
      <ShowTablePage
        totalRows={totalRows}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onChangePage={(page: number) => dispatch(setStorageCurrentPage(page))}
        onChangeRowsPerPage={(rows: number) =>
          dispatch(setStorageRowsPerPage(rows))
        }
      />
    </div>
  );
}
