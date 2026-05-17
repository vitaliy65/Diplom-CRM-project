import { Ticket, UserProfile } from "./types";

/**
 * Вычисляет среднее время ремонта (в днях) для всех мастеров.
 * Возвращает число с 1 знаком после запятой. Если нет завершённых тикетов — возвращает null.
 *
 * @param tickets Список всех тикетов
 * @returns Среднее время ремонта в днях (number) или null, если нет завершённых тикетов
 */
export function getAverageRepairTimeForAllMasters(
  tickets: Ticket[],
): number | null {
  console.log(tickets);
  // Фильтруем завершённые тикеты (ready/delivered) и у которых есть даты начала и окончания
  const completedTickets = tickets.filter(
    (t) =>
      (t.status === "ready" || t.status === "delivered") &&
      t.createdAt &&
      t.readyAt,
  );

  if (completedTickets.length === 0) return null;

  // Суммируем разницу между createdAt и readyAt
  let totalMs = 0;

  for (const ticket of completedTickets) {
    const created = new Date(ticket.createdAt).getTime();
    const ready = new Date(ticket.readyAt).getTime();
    if (!isNaN(created) && !isNaN(ready) && ready > created) {
      totalMs += ready - created;
    }
  }

  const avgMs = totalMs / completedTickets.length;
  const days = avgMs / (1000 * 60 * 60 * 24);
  // Округляем до 1 знака после запятой
  console.log(Math.round(days * 10) / 10);
  return Math.round(days * 10) / 10;
}

/**
 * Вычисляет процент тикетов, завершённых без SLA нарушения.
 * Возвращает целое число 0–100.
 *
 * @param tickets Список всех тикетов
 * @returns Процент тикетов, завершённых без SLA нарушения (0–100)
 */
export function getSlaPercent(tickets: Ticket[]): number {
  // Считаем только тикеты, которые завершены (ready/delivered)
  const completed = tickets.filter(
    (t) => t.status === "ready" || t.status === "delivered",
  );
  if (completed.length === 0) return 0;

  const withoutViolation = completed.filter((t) => !t.slaViolation).length;
  return Math.round((withoutViolation / completed.length) * 100);
}
