"use client";

import TableViewBox from "@/components/static/TableViewBox";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectPaginatedClients,
  selectClientsTotalRows,
  selectClientsCurrentPage,
  selectClientsRowsPerPage,
  setCurrentPage,
  setRowsPerPage,
  setFilteredClients,
  selectClients,
} from "@/store/slices/clients-slice";
import TopViewButtons from "@/components/buttons/TopViewButtons";
import ShowTablePage from "@/components/static/ShowTablePage";
import type { Client } from "@/lib/types";
import { CreateClientDialog } from "./CreateClientDialog";
import { clientConfig } from "@/filters";
import { EditClientDialog } from "./EditClientDialog";
import { useState } from "react";

// порядок отображения полей таблицы клиентов
const CLIENT_COLUMNS: Array<keyof Client> = [
  "name",
  "email",
  "phone",
  "ticketCount",
];

// Тип для ассоциации строки с clientId
type TableRowWithClientId = {
  row: { text: string }[];
  clientId: string;
};

export default function ClientsContainerLayout() {
  const dispatch = useAppDispatch();

  const paginatedClients = useAppSelector(selectPaginatedClients);
  const clients = useAppSelector(selectClients);
  const totalRows = useAppSelector(selectClientsTotalRows);
  const currentPage = useAppSelector(selectClientsCurrentPage);
  const rowsPerPage = useAppSelector(selectClientsRowsPerPage);

  const headers = CLIENT_COLUMNS as string[];

  // Associate each row with clientId for edit support
  const data: TableRowWithClientId[] = paginatedClients.map((client) => {
    const row = headers.map((key) => ({
      text:
        client[key as keyof Client] == null
          ? ""
          : String(client[key as keyof Client]),
    }));
    return { row, clientId: client.id };
  });

  // State for editing client dialog
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  const handleRowClick = (clientId?: string) => {
    if (!clientId) return;
    const client = clients.find((c) => c.id === clientId);
    if (client) setEditingClient(client);
  };

  return (
    <div className="container-layout">
      <TopViewButtons
        ChildrenCreateDialog={<CreateClientDialog />}
        data={clients}
        filterConfig={clientConfig}
        onSort={(result, filterActive) =>
          dispatch(setFilteredClients({ items: result, filterActive }))
        }
      />
      <TableViewBox
        headers={headers}
        data={data.map((d) => d.row)}
        onRowClick={(idx: number) => handleRowClick(data[idx]?.clientId)}
      />
      <ShowTablePage
        totalRows={totalRows}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onChangePage={(page) => dispatch(setCurrentPage(page))}
        onChangeRowsPerPage={(n) => dispatch(setRowsPerPage(n))}
      />
      <EditClientDialog
        editingClient={editingClient}
        setEditingClient={setEditingClient}
        saving={saving}
      />
    </div>
  );
}
