"use client";

import TableViewBox, { TableRow } from "@/components/static/TableViewBox";
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
  deleteClient,
} from "@/store/slices/clients-slice";
import { selectTickets } from "@/store/slices/tickets-slice";
import TopViewButtons from "@/components/buttons/TopViewButtons";
import ShowTablePage from "@/components/static/ShowTablePage";
import type { Client } from "@/lib/types";
import { CreateClientDialog } from "./CreateClientDialog";
import { clientConfig } from "@/filters";
import { EditClientDialog } from "./EditClientDialog";
import { useState, useEffect } from "react";
import { clientsExportConfig } from "@/lib/csv/Exportconfigs";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

// порядок отображения полей таблицы клиентов
const CLIENT_COLUMNS = ["name", "email", "phone", "clientTickets"];

// Тип для ассоциации строки с clientId и obj с заказами клиента
type TableRowWithClientId = {
  row: TableRow[];
  clientId: string;
};

export default function ClientsContainerLayout() {
  const dispatch = useAppDispatch();

  const paginatedClients = useAppSelector(selectPaginatedClients);
  const clients = useAppSelector(selectClients);
  const totalRows = useAppSelector(selectClientsTotalRows);
  const currentPage = useAppSelector(selectClientsCurrentPage);
  const rowsPerPage = useAppSelector(selectClientsRowsPerPage);

  // Все тикеты для поиска заказов клиента
  const allTickets = useAppSelector(selectTickets);

  const headers = CLIENT_COLUMNS as string[];
  const searchParams = useSearchParams();

  useEffect(() => {
    const Id = searchParams?.get("id");
    if (Id) {
      const filtered = clients.filter((c) => c.id === Id);
      dispatch(setFilteredClients({ items: filtered, filterActive: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, clients, searchParams]);

  // Строим таблицу с obj-заказами для TableViewBox
  const data: TableRowWithClientId[] = paginatedClients.map((client) => {
    const row = headers.map((key) => {
      let base: TableRow = {
        text:
          client[key as keyof Client] == null
            ? ""
            : String(client[key as keyof Client]),
      };
      // Добавляем obj только к первой колонке (например, к name)
      if (key === "clientTickets") {
        // Найдём все тикеты этого клиента
        const clientTickets = allTickets.filter(
          (ticket) => ticket.clientId === client.id,
        );
        if (clientTickets.length > 0) {
          base = {
            ...base,
            obj: clientTickets.map((ticket) => ({
              labelText: `${ticket.device}`,
              id: ticket.id,
              viewType: "tickets",
            })),
          };
        }
      }
      return base;
    });
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

  const handleDeleteRows = async (rowIndices: number[]) => {
    const ids = rowIndices
      .map((idx) => data[idx]?.clientId)
      .filter((id): id is string => Boolean(id));
    if (ids.length === 0) return;
    const results = await Promise.allSettled(
      ids.map((id) => dispatch(deleteClient(id)).unwrap()),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = ids.length - failed;
    if (succeeded > 0) toast.success(`Видалено клієнтів: ${succeeded}`);
    if (failed > 0) toast.error(`Не вдалося видалити: ${failed}`);
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
        exportSelector={clientsExportConfig.selector}
        exportOptions={clientsExportConfig.options}
      />
      <TableViewBox
        headers={headers}
        data={data.map((d) => d.row)}
        onRowClick={(idx: number) => handleRowClick(data[idx]?.clientId)}
        onDeleteRows={handleDeleteRows}
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
