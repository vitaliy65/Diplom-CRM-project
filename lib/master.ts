import { Ticket } from "./types";
import { computeSlaViolation } from "./sla";

/**
 * Середній час ремонту (дні) по всіх завершених заявках.
 * Для статистики по майстрах використовуйте getAverageRepairTimeByMaster.
 */
export function getGlobalAverageRepairTimeDays(
  tickets: Ticket[],
): number | null {
  const completedTickets = tickets.filter(
    (t) =>
      (t.status === "ready" || t.status === "delivered") &&
      t.createdAt &&
      t.readyAt,
  );

  if (completedTickets.length === 0) return null;

  let totalMs = 0;
  let counted = 0;

  for (const ticket of completedTickets) {
    const created = new Date(ticket.createdAt).getTime();
    const ready = new Date(ticket.readyAt).getTime();
    if (!Number.isNaN(created) && !Number.isNaN(ready) && ready > created) {
      totalMs += ready - created;
      counted += 1;
    }
  }

  if (counted === 0) return null;

  const days = totalMs / counted / (1000 * 60 * 60 * 24);
  return Math.round(days * 10) / 10;
}

/** Середній час ремонту по кожному майстру (masterId → дні) */
export function getAverageRepairTimeByMaster(
  tickets: Ticket[],
): Record<string, number> {
  const byMaster: Record<string, { totalMs: number; count: number }> = {};

  for (const ticket of tickets) {
    if (
      !ticket.masterId ||
      (ticket.status !== "ready" && ticket.status !== "delivered") ||
      !ticket.createdAt ||
      !ticket.readyAt
    ) {
      continue;
    }
    const created = new Date(ticket.createdAt).getTime();
    const ready = new Date(ticket.readyAt).getTime();
    if (Number.isNaN(created) || Number.isNaN(ready) || ready <= created) {
      continue;
    }
    const entry = byMaster[ticket.masterId] ?? { totalMs: 0, count: 0 };
    entry.totalMs += ready - created;
    entry.count += 1;
    byMaster[ticket.masterId] = entry;
  }

  const result: Record<string, number> = {};
  for (const [masterId, { totalMs, count }] of Object.entries(byMaster)) {
    if (count === 0) continue;
    const days = totalMs / count / (1000 * 60 * 60 * 24);
    result[masterId] = Math.round(days * 10) / 10;
  }
  return result;
}

/**
 * Відсоток завершених заявок без порушення SLA (обчислюється, не з ручного прапорця).
 * null — якщо немає завершених заявок.
 */
export function getSlaPercent(tickets: Ticket[]): number | null {
  const completed = tickets.filter(
    (t) => t.status === "ready" || t.status === "delivered",
  );
  if (completed.length === 0) return null;

  const withoutViolation = completed.filter(
    (t) => !computeSlaViolation(t),
  ).length;
  return Math.round((withoutViolation / completed.length) * 100);
}

/** @deprecated Використовуйте getGlobalAverageRepairTimeDays */
export const getAverageRepairTimeForAllMasters = getGlobalAverageRepairTimeDays;
