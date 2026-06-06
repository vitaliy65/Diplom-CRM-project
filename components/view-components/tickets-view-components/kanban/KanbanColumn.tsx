"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Ticket, TicketStatus } from "@/lib/types";
import { statusLabels } from "@/lib/types";
import KanbanCard from "./KanbanCard";

const columnAccent: Record<TicketStatus, string> = {
  received: "bg-status-received",
  "in-progress": "bg-status-in-progress",
  ready: "bg-status-ready",
  delivered: "bg-status-delivered",
};

interface KanbanColumnProps {
  status: TicketStatus;
  tickets: Ticket[];
  getClientName: (ticket: Ticket) => string;
  getMasterName: (ticket: Ticket) => string | null;
  onCardClick: (ticket: Ticket) => void;
  draggingTicket: Ticket | null;
  onDragStart: (ticket: Ticket) => void;
  onDragEnd: () => void;
  onDrop: (status: TicketStatus) => void;
  canDropHere: boolean;
}

export default function KanbanColumn({
  status,
  tickets,
  getClientName,
  getMasterName,
  onCardClick,
  draggingTicket,
  onDragStart,
  onDragEnd,
  onDrop,
  canDropHere,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const showDropTarget = isOver && canDropHere && draggingTicket;

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/40">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${columnAccent[status]}`} />
          <h3 className="text-sm font-semibold text-foreground">
            {statusLabels[status]}
          </h3>
        </div>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tickets.length}
        </span>
      </div>

      <div
        onDragOver={(e) => {
          if (!canDropHere) return;
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          if (canDropHere) onDrop(status);
        }}
        className={
          "flex min-h-32 flex-1 flex-col gap-2 p-2 transition-colors " +
          (showDropTarget ? "bg-primary/5 ring-2 ring-inset ring-primary/40 rounded-b-xl" : "")
        }
      >
        <AnimatePresence mode="popLayout">
          {tickets.map((ticket) => (
            <KanbanCard
              key={ticket.id}
              ticket={ticket}
              clientName={getClientName(ticket)}
              masterName={getMasterName(ticket)}
              onClick={onCardClick}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingTicket?.id === ticket.id}
            />
          ))}
        </AnimatePresence>

        {tickets.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border py-6 text-xs text-muted-foreground">
            Порожньо
          </div>
        )}
      </div>
    </div>
  );
}
