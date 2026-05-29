import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Ticket } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const daysOfWeek = [
  { day: "Пн", idx: 1 },
  { day: "Вт", idx: 2 },
  { day: "Ср", idx: 3 },
  { day: "Чт", idx: 4 },
  { day: "Пт", idx: 5 },
  { day: "Сб", idx: 6 },
  { day: "Нд", idx: 0 }, // Воскресенье/Неділя, 0 - для JS getDay()
];

export function getWeeklyData(tickets: Ticket[]) {
  // Массив для дней недели, начиная с понедельника (на текущей неделе)
  const today = new Date();
  // Определить начало недели (понедельник)
  const weekDays: { [idx: number]: string } = {
    1: "Пн",
    2: "Вт",
    3: "Ср",
    4: "Чт",
    5: "Пт",
    6: "Сб",
    0: "Нд",
  };

  // Получаем даты текущей недели с понедельника по воскресенье
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    // День недели в JS: 0 - воскресенье, 1 - понедельник...
    // Поэтому для ПН (1) - отнять ((today.getDay()+6)%7) для получения понедельника
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Словарь для подсчета
  const result = weekDates.map((date, idx) => ({
    day: daysOfWeek[idx].day,
    tickets: 0,
    completed: 0,
  }));

  for (const ticket of tickets) {
    // Ожидается, что ticket.createdAt и ticket.readyAt - строки/даты
    const created = ticket.createdAt ? new Date(ticket.createdAt) : null;
    const completed =
      ticket.status === "ready" || ticket.status === "delivered"
        ? ticket.readyAt
          ? new Date(ticket.readyAt)
          : null
        : null;

    // Найти, попадает ли created в этот день недели
    if (created) {
      created.setHours(0, 0, 0, 0);
      const idx = weekDates.findIndex((d) => d.getTime() === created.getTime());
      if (idx !== -1) {
        result[idx].tickets += 1;
      }
    }

    // Аналогично для завершённых (ready/delivered)
    if (completed) {
      completed.setHours(0, 0, 0, 0);
      const idx = weekDates.findIndex(
        (d) => d.getTime() === completed.getTime(),
      );
      if (idx !== -1) {
        result[idx].completed += 1;
      }
    }
  }
  return result;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}
