"use client";

import TableViewBox, { TableRow } from "@/components/static/TableViewBox";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectClients } from "@/store/slices/clients-slice";
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
import type { Ticket } from "@/lib/types";
import ShowTablePage from "@/components/static/ShowTablePage";

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

// Удаляем все поля id, clientName и masterName из списка ключей для отображения
function filterTableColumns(columns: string[]): string[] {
  return columns.filter(
    (header) =>
      header !== "id" && header !== "clientName" && header !== "masterName",
  );
}

type TableRowWithTicketId = {
  row: TableRow[];
  ticketId: string;
};

interface TicketTableViewProps {
  onRowClick: (ticketId?: string) => void;
}

export default function TicketTableView({ onRowClick }: TicketTableViewProps) {
  const dispatch = useAppDispatch();
  const paginatedTickets = useAppSelector(selectPaginatedTickets);
  const masters = useAppSelector(selectMasters);
  const clients = useAppSelector(selectClients);
  const services = useAppSelector(selectServices);

  const totalRows = useAppSelector(selectTicketsTotalRows);
  const currentPage = useAppSelector(selectTicketsCurrentPage);
  const rowsPerPage = useAppSelector(selectTicketsRowsPerPage);

  const headers = filterTableColumns(TICKET_COLUMNS as string[]);

  const data: TableRowWithTicketId[] = paginatedTickets.map((ticket) => {
    const row: TableRow[] = headers.map((key) => {
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
              viewType: "users" as ViewType,
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

      // createdAt / readyAt → toFullDateTime
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
    return { row, ticketId: ticket.id };
  });

  return (
    <>
      <TableViewBox
        headers={headers}
        data={data.map((d) => d.row)}
        onRowClick={(idx: number) => onRowClick(data[idx]?.ticketId)}
      />
      <ShowTablePage
        totalRows={totalRows}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onChangePage={(page: number) => dispatch(setCurrentPage(page))}
        onChangeRowsPerPage={(rows: number) => dispatch(setRowsPerPage(rows))}
      />
    </>
  );
}
