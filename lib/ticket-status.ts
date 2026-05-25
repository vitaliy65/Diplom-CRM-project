import type { TicketStatus, UserRole } from "@/lib/types";

const NEXT_STATUS: Record<TicketStatus, TicketStatus[]> = {
  received: ["in-progress"],
  "in-progress": ["ready"],
  ready: ["delivered"],
  delivered: [],
};

/** Чи дозволений перехід (лише вперед по ланцюгу, без відкату) */
export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) return true;
  return NEXT_STATUS[from]?.includes(to) ?? false;
}

/** Дозволені цільові статуси з урахуванням ролі */
export function getAllowedTargetStatuses(
  current: TicketStatus,
  role?: UserRole,
): TicketStatus[] {
  const next = NEXT_STATUS[current] ?? [];
  if (role === "master") {
    return next.filter((s) => s === "in-progress" || s === "ready");
  }
  return next;
}

/** Опції для select: поточний + дозволені наступні */
export function getStatusOptionsForSelect(
  current: TicketStatus,
  role?: UserRole,
): TicketStatus[] {
  return [current, ...getAllowedTargetStatuses(current, role)];
}

/** Наступний статус у ланцюгу (один крок вперед) */
export function getNextStatus(current: TicketStatus): TicketStatus | null {
  return NEXT_STATUS[current]?.[0] ?? null;
}

export function getStatusTransitionError(
  from: TicketStatus,
  to: TicketStatus,
): string | null {
  if (from === to) return null;
  if (!canTransition(from, to)) {
    return `Недопустимий перехід статусу: ${from} → ${to}`;
  }
  return null;
}
