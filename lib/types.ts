export type UserRole = "admin" | "manager" | "master";

export type TicketStatus = "received" | "in-progress" | "ready" | "delivered";

export interface Ticket {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  device: string;
  problem: string;
  status: TicketStatus;
  masterId: string | null;
  masterName: string | null;
  createdAt: string;
  readyAt: string;
  slaViolation: boolean;
  comments: string[];
  services: Service[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  ticketCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

// Новый интерфейс Service
export interface Service {
  id: string;
  name: string;
  base_price: number;
  final_price: number;
  discount: number;
}

export interface StatusLog {
  ticketId: string;
  oldStatus: TicketStatus;
  newStatus: TicketStatus;
  changedBy: string;
  changedByName: string;
  createdAt: string;
}

export const statusLabels: Record<TicketStatus, string> = {
  received: "Прийнято",
  "in-progress": "У роботі",
  ready: "Готово",
  delivered: "Видано клієнту",
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Адміністратор",
  manager: "Менеджер",
  master: "Майстер",
};
