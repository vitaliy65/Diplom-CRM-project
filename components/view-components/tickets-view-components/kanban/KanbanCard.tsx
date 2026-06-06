"use client";

import { motion } from "framer-motion";
import { CalendarClock, User, Wrench, AlertTriangle } from "lucide-react";
import type { Ticket } from "@/lib/types";
import { formatDate } from "@/lib/time";

interface KanbanCardProps {
  ticket: Ticket;
  clientName: string;
  masterName: string | null;
  onClick: (ticket: Ticket) => void;
  onDragStart: (ticket: Ticket) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export default function KanbanCard({
  ticket,
  clientName,
  masterName,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: KanbanCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      draggable
      onDragStart={() => onDragStart(ticket)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(ticket)}
      className="bento-card cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm active:cursor-grabbing hover:border-primary/50"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(ticket);
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-foreground line-clamp-1">
          {ticket.device || "—"}
        </p>
        {ticket.slaViolation && (
          <span
            className="flex shrink-0 items-center gap-1 rounded-md bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
            title="Порушення SLA"
          >
            <AlertTriangle className="h-3 w-3" />
            SLA
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
        {ticket.problem || "Без опису"}
      </p>

      <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{clientName || "—"}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Wrench className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{masterName || "Не призначено"}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDate(ticket.createdAt)}</span>
        </span>
      </div>
    </motion.div>
  );
}
