import type { Ticket } from "@/lib/types";
import { SLA_REPAIR_DAYS } from "@/lib/constants";

/** Обчислює порушення SLA за датами, без ручного прапорця */
export function computeSlaViolation(ticket: Ticket): boolean {
  const start = new Date(ticket.createdAt).getTime();
  if (Number.isNaN(start)) return false;

  const isCompleted =
    ticket.status === "ready" || ticket.status === "delivered";
  const endRaw =
    isCompleted && ticket.readyAt ? ticket.readyAt : new Date().toISOString();
  const end = new Date(endRaw).getTime();
  if (Number.isNaN(end) || end <= start) return false;

  const days = (end - start) / (1000 * 60 * 60 * 24);
  return days > SLA_REPAIR_DAYS;
}
