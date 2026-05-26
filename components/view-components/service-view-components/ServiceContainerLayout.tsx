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
import { EditServiceDialog } from "./EditServiceDialog";
import { useState } from "react";
import { servicesExportConfig } from "@/lib/csv/Exportconfigs";

// порядок отображения полей таблицы сервисов
const SERVICE_COLUMNS: Array<keyof Service> = [
  "name",
  "base_price",
  "final_price",
  "discount",
];

// Тип для ассоциации строки с serviceId
type TableRowWithServiceId = {
  row: { text: string }[];
  serviceId: string;
};

export default function ServiceContainerLayout() {
  const dispatch = useAppDispatch();

  const paginatedServices = useAppSelector(selectPaginatedServices);
  const services = useAppSelector(selectServices);
  const totalRows = useAppSelector(selectServicesTotalRows);
  const currentPage = useAppSelector(selectServicesCurrentPage);
  const rowsPerPage = useAppSelector(selectServicesRowsPerPage);

  const headers = SERVICE_COLUMNS as string[];

  // Associate each row with serviceId for edit support
  const data: TableRowWithServiceId[] = paginatedServices.map((svc) => {
    const row = headers.map((key) => ({
      text:
        svc[key as keyof Service] == null
          ? ""
          : String(svc[key as keyof Service]),
    }));
    return { row, serviceId: svc.id };
  });

  // State for editing service dialog
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  const handleRowClick = (serviceId?: string) => {
    if (!serviceId) return;
    const service = services.find((s) => s.id === serviceId);
    if (service) setEditingService(service);
  };

  return (
    <div className="container-layout">
      <TopViewButtons
        ChildrenCreateDialog={<CreateServiceDialog />}
        data={services}
        filterConfig={serviceConfig}
        onSort={(result, filterActive) =>
          dispatch(setFilteredItems({ items: result, filterActive }))
        }
        exportSelector={servicesExportConfig.selector}
        exportOptions={servicesExportConfig.options}
      />
      <TableViewBox
        headers={headers}
        data={data.map((d) => d.row)}
        onRowClick={(idx: number) => handleRowClick(data[idx]?.serviceId)}
      />
      <ShowTablePage
        totalRows={totalRows}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onChangePage={(page) => dispatch(setCurrentPage(page))}
        onChangeRowsPerPage={(n) => dispatch(setRowsPerPage(n))}
      />
      <EditServiceDialog
        editingService={editingService}
        setEditingService={setEditingService}
        saving={saving}
      />
    </div>
  );
}
