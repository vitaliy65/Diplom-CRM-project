"use client";

import TableViewBox, { TableRow } from "../static/TableViewBox";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectClients } from "@/store/slices/clients-slice";
import TopViewButtons from "../buttons/TopViewButtons";
import {
  selectPaginatedTickets,
  selectTicketsTotalRows,
  selectTicketsCurrentPage,
  selectTicketsRowsPerPage,
  setCurrentPage,
  setRowsPerPage,
} from "@/store/slices/tickets-slice";
import { selectMasters } from "@/store/slices/users-slice";
import { selectServices } from "@/store/slices/services-slice";
import type { ViewType } from "@/static/MenuItems";
import { toFullDateTime } from "@/lib/time";
import { Ticket } from "@/lib/types";
import ShowTablePage from "../static/ShowTablePage";

// Статичный порядок отображения полей (ключей тикета) в таблице
const TICKET_COLUMNS: Array<keyof Ticket> = [
  "clientId",
  "device",
  "problem",
  "status",
  "masterId",
  "createdAt",
  "readyAt",
  "slaViolation",
  "comments",
  "services",
  "usedParts",
];

// Удаляем все поля id, clientName и masterName из списка ключей для отображения (если вдруг они попали)
function filterTableColumns(columns: string[]): string[] {
  return columns.filter(
    (header) =>
      header !== "id" && header !== "clientName" && header !== "masterName",
  );
}

export default function TicketContainerLayout() {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector(selectPaginatedTickets);
  const masters = useAppSelector(selectMasters);
  const clients = useAppSelector(selectClients);
  const services = useAppSelector(selectServices);

  const totalRows = useAppSelector(selectTicketsTotalRows);
  const currentPage = useAppSelector(selectTicketsCurrentPage);
  const rowsPerPage = useAppSelector(selectTicketsRowsPerPage);

  // Используем фиксированный порядок ключей для колонок таблицы
  const rawHeaders = filterTableColumns(TICKET_COLUMNS as string[]);
  const headers = rawHeaders; // id/name поля уже удалены выше

  const data = tickets.map((ticket) => {
    const row: TableRow[] = rawHeaders.map((key) => {
      const value = ticket[key as keyof Ticket];

      // clientId → clients
      if (key === "clientId" && value) {
        const client = clients.find((c) => c.id === value);
        return {
          text: "",
          obj: [
            {
              labelText:
                typeof client?.name === "string" ? client.name : String(value),
              id: String(value),
              viewType: "clients" as ViewType,
            },
          ],
        };
      }

      // masterId → masters
      if (key === "masterId" && value) {
        const master = masters.find((m) => m.id === value);
        return {
          text: "",
          obj: [
            {
              labelText:
                typeof master?.name === "string" ? master.name : String(value),
              id: String(value),
              viewType: "master" as ViewType,
            },
          ],
        };
      }

      // services: string[] → services[]
      if (key === "services" && Array.isArray(value)) {
        const obj: { labelText: string; id: string; viewType: ViewType }[] = (
          value as string[]
        )
          .map((serviceId) => {
            const service = services.find((s) => s.id === serviceId);
            if (service) {
              return {
                labelText: service.name,
                id: service.id,
                viewType: "services" as ViewType,
              };
            }
            return undefined;
          })
          .filter(
            (it): it is { labelText: string; id: string; viewType: ViewType } =>
              Boolean(it),
          );
        return {
          text: "",
          obj,
        };
      }

      // usedParts: UsedPartsTicket[] → storage[]
      if (key === "usedParts" && Array.isArray(value)) {
        const obj: { labelText: string; id: string; viewType: ViewType }[] = (
          value as Array<{ id: string; name: string }>
        )
          .map((part) =>
            part.id && part.name
              ? {
                  labelText: part.name,
                  id: part.id,
                  viewType: "storage" as ViewType,
                }
              : undefined,
          )
          .filter(
            (it): it is { labelText: string; id: string; viewType: ViewType } =>
              Boolean(it),
          );
        return {
          text: "",
          obj,
        };
      }

      // createdAt → toFullDateTime
      if (key === "createdAt" || (key === "readyAt" && value)) {
        return {
          text: toFullDateTime(value as string),
        };
      }

      // default
      return {
        text: value == null ? "" : String(value),
      };
    });
    return row;
  });

  return (
    <div className="flex h-full flex-col flex-1 gap-4">
      <TopViewButtons
        ChildrenCreateDialog={<CreateTicketDialog clients={clients} />}
      />
      <TableViewBox headers={headers} data={data} />
      <ShowTablePage
        totalRows={totalRows}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onChangePage={(page: number) => dispatch(setCurrentPage(page))}
        onChangeRowsPerPage={(rows: number) => dispatch(setRowsPerPage(rows))}
      />
    </div>
  );
}
