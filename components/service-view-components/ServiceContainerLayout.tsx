"use client";

import TableViewBox from "../static/TableViewBox";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectPaginatedServices,
  selectServicesTotalRows,
  selectServicesCurrentPage,
  selectServicesRowsPerPage,
  setCurrentPage,
  setRowsPerPage,
} from "@/store/slices/services-slice";
import TopViewButtons from "../buttons/TopViewButtons";
import ShowTablePage from "../static/ShowTablePage";
import type { Service } from "@/lib/types";
import { CreateServiceDialog } from "./CreateServiceDialog";

// порядок отображения полей таблицы сервисов
const SERVICE_COLUMNS: Array<keyof Service> = [
  "name",
  "base_price",
  "final_price",
  "discount",
];

export default function ServiceContainerLayout() {
  const dispatch = useAppDispatch();

  const services = useAppSelector(selectPaginatedServices);
  const totalRows = useAppSelector(selectServicesTotalRows);
  const currentPage = useAppSelector(selectServicesCurrentPage);
  const rowsPerPage = useAppSelector(selectServicesRowsPerPage);

  const headers = SERVICE_COLUMNS as string[];

  const data = services.map((svc) =>
    headers.map((key) => ({
      text:
        svc[key as keyof Service] == null
          ? ""
          : String(svc[key as keyof Service]),
    })),
  );

  return (
    <div className="flex h-full flex-col flex-1 gap-4">
      <TopViewButtons ChildrenCreateDialog={<CreateServiceDialog />} />
      <TableViewBox headers={headers} data={data} />
      <ShowTablePage
        totalRows={totalRows}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onChangePage={(page) => dispatch(setCurrentPage(page))}
        onChangeRowsPerPage={(n) => dispatch(setRowsPerPage(n))}
      />
    </div>
  );
}
