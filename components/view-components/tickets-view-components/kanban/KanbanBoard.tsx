"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectClients } from "@/store/slices/clients-slice";
import { selectMasters } from "@/store/slices/users-slice";
import {
  selectTickets,
  changeTicketStatus,
} from "@/store/slices/tickets-slice";
import { canTransition, getStatusTransitionError } from "@/lib/ticket-status";
import type { Ticket, TicketStatus } from "@/lib/types";
import KanbanColumn from "./KanbanColumn";

const COLUMN_ORDER: TicketStatus[] = [
  "received",
  "in-progress",
  "ready",
  "delivered",
];

interface KanbanBoardProps {
  onCardClick: (ticket: Ticket) => void;
}

export default function KanbanBoard({ onCardClick }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector(selectTickets);
  const clients = useAppSelector(selectClients);
  const masters = useAppSelector(selectMasters);

  const [draggingTicket, setDraggingTicket] = useState<Ticket | null>(null);

  const ticketsByStatus = useMemo(() => {
    const grouped: Record<TicketStatus, Ticket[]> = {
      received: [],
      "in-progress": [],
      ready: [],
      delivered: [],
    };
    for (const ticket of tickets) {
      if (grouped[ticket.status]) grouped[ticket.status].push(ticket);
    }
    return grouped;
  }, [tickets]);

  const getClientName = (ticket: Ticket) =>
    clients.find((c) => c.id === ticket.clientId)?.name ?? ticket.clientName ?? "";

  const getMasterName = (ticket: Ticket) =>
    ticket.masterId
      ? masters.find((m) => m.id === ticket.masterId)?.name ??
        ticket.masterName ??
        null
      : null;

  const handleDrop = async (newStatus: TicketStatus) => {
    const ticket = draggingTicket;
    setDraggingTicket(null);
    if (!ticket || ticket.status === newStatus) return;

    const error = getStatusTransitionError(ticket.status, newStatus);
    if (error) {
      toast.error(error);
      return;
    }

    const result = await dispatch(
      changeTicketStatus({
        id: ticket.id,
        oldStatus: ticket.status,
        newStatus,
      }),
    );

    if (changeTicketStatus.rejected.match(result)) {
      toast.error((result.payload as string) || "Не вдалося змінити статус.");
    }
  };

  return (
    <div className="bento-card overflow-x-auto rounded-xl p-3 hover:scale-none!">
      <div className="flex gap-3">
        {COLUMN_ORDER.map((status) => {
          const canDropHere = draggingTicket
            ? canTransition(draggingTicket.status, status)
            : false;

          return (
            <KanbanColumn
              key={status}
              status={status}
              tickets={ticketsByStatus[status]}
              getClientName={getClientName}
              getMasterName={getMasterName}
              onCardClick={onCardClick}
              draggingTicket={draggingTicket}
              onDragStart={setDraggingTicket}
              onDragEnd={() => setDraggingTicket(null)}
              onDrop={handleDrop}
              canDropHere={canDropHere}
            />
          );
        })}
      </div>
    </div>
  );
}
