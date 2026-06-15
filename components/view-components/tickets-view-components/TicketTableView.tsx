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
  deleteTicket,
} from "@/store/slices/tickets-slice";
import { selectMasters } from "@/store/slices/users-slice";
import { selectServices } from "@/store/slices/services-slice";
import type { ViewType } from "@/static/MenuItems";
import { toFullDateTime } from "@/lib/time";
import type { Ticket, Comment } from "@/lib/types";
import ShowTablePage from "@/components/static/ShowTablePage";
import { toast } from "sonner";

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

      // comments: Comment[] → показує кількість та авторів коментарів
      if (key === "comments" && Array.isArray(value) && value.length > 0) {
        // Відображаємо label "N коментарів", список авторів у tooltip
        const comments = value as Comment[];
        const authorsCount: Record<string, number> = {};
        comments.forEach((c) => {
          if (c.authorName) {
            authorsCount[c.authorName] = (authorsCount[c.authorName] ?? 0) + 1;
          }
        });
        const authorsTooltip = Object.entries(authorsCount)
          .map(([author, count]) => `${author}: ${count}`)
          .join(", ");

        return {
          text: `${comments.length} коментар${comments.length === 1 ? "" : comments.length < 5 ? "і" : "ів"}`,
          obj: authorsTooltip
            ? [
                {
                  labelText: authorsTooltip,
                  id: ticket.id + "-comments",
                  viewType: null,
                },
              ]
            : undefined,
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
      if ((key === "createdAt" || key === "readyAt") && value) {
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

  const handleDeleteRows = async (rowIndices: number[]) => {
    const ids = rowIndices
      .map((idx) => data[idx]?.ticketId)
      .filter((id): id is string => Boolean(id));
    if (ids.length === 0) return;
    const results = await Promise.allSettled(
      ids.map((id) => dispatch(deleteTicket(id)).unwrap()),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = ids.length - failed;
    if (succeeded > 0) toast.success(`Видалено заявок: ${succeeded}`);
    if (failed > 0) toast.error(`Не вдалося видалити: ${failed}`);
  };

  return (
    <>
      <TableViewBox
        headers={headers}
        data={data.map((d) => d.row)}
        onRowClick={(idx: number) => onRowClick(data[idx]?.ticketId)}
        onDeleteRows={handleDeleteRows}
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
