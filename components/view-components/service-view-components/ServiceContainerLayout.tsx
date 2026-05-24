"use client";

import TableViewBox from "@/components/static/TableViewBox";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectPaginatedServices,
  selectServicesTotalRows,
  selectServicesCurrentPage,
  selectServicesRowsPerPage,
  setCurrentPage,
  setRowsPerPage,
  selectServices,
  setFilteredItems,
} from "@/store/slices/services-slice";
import TopViewButtons from "@/components/buttons/TopViewButtons";
import ShowTablePage from "@/components/static/ShowTablePage";
import type { Service } from "@/lib/types";
import { CreateServiceDialog } from "./CreateServiceDialog";
import { serviceConfig } from "@/filters";

// порядок отображения полей таблицы сервисов
const SERVICE_COLUMNS: Array<keyof Service> = [
  "name",
  "base_price",
  "final_price",
  "discount",
];

export default function ServiceContainerLayout() {
  const dispatch = useAppDispatch();

  const paginatedServices = useAppSelector(selectPaginatedServices);
  const services = useAppSelector(selectServices);
  const totalRows = useAppSelector(selectServicesTotalRows);
  const currentPage = useAppSelector(selectServicesCurrentPage);
  const rowsPerPage = useAppSelector(selectServicesRowsPerPage);

  const headers = SERVICE_COLUMNS as string[];

  const data = paginatedServices.map((svc) =>
    headers.map((key) => ({
      text:
        svc[key as keyof Service] == null
          ? ""
          : String(svc[key as keyof Service]),
    })),
  );

  return (
    <div className="flex h-full flex-col flex-1 gap-4">
      <TopViewButtons
        ChildrenCreateDialog={<CreateServiceDialog />}
        data={services}
        filterConfig={serviceConfig}
        onSort={(result) => dispatch(setFilteredItems(result))}
      />
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
