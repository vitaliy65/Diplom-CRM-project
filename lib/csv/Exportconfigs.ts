import { selectClients } from "@/store/slices/clients-slice";
import { selectServices } from "@/store/slices/services-slice";
import { selectStorage } from "@/store/slices/storage-slice";
import { selectTickets } from "@/store/slices/tickets-slice";
import type { RootState } from "@/store";
import { ExportCsvOptions } from "./exportCsv";

export interface SliceExportConfig<T extends object> {
  selector: (state: RootState) => T[];
  options: ExportCsvOptions;
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export const ticketsExportConfig: SliceExportConfig<object> = {
  selector: selectTickets,
  options: {
    filename: "заявки",
    // Complex nested arrays are not useful in flat CSV — exclude them.
    excludeColumns: [
      "clientId",
      "masterId",
      "comments",
      "services",
      "usedParts",
    ],
    headers: {
      id: "ID",
      clientName: "Клієнт",
      clientPhone: "Телефон клієнта",
      masterName: "Майстер",
      status: "Статус",
      // Map whatever the actual field names are in your Ticket type:
      device: "Пристрій",
      problem: "Опис проблеми",
      deviceType: "Тип пристрою",
      deviceModel: "Модель пристрою",
      problemDescription: "Опис проблеми",
      totalCost: "Сума (грн)",
      slaViolation: "Порушення SLA",
      createdAt: "Дата створення",
      readyAt: "Дата готовності",
    },
  },
};

// ─── Clients ──────────────────────────────────────────────────────────────────

export const clientsExportConfig: SliceExportConfig<object> = {
  selector: selectClients,
  options: {
    filename: "клієнти",
    headers: {
      id: "ID",
      name: "Ім'я",
      phone: "Телефон",
      email: "Email",
      address: "Адреса",
      ticketCount: "Кількість заявок",
      createdAt: "Дата реєстрації",
    },
  },
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const servicesExportConfig: SliceExportConfig<object> = {
  selector: selectServices,
  options: {
    filename: "послуги",
    headers: {
      id: "ID",
      name: "Назва послуги",
      price: "Ціна (грн)",
      description: "Опис",
      createdAt: "Дата додавання",
    },
  },
};

// ─── Storage (Spare Parts) ────────────────────────────────────────────────────

export const storageExportConfig: SliceExportConfig<object> = {
  selector: selectStorage,
  options: {
    filename: "запчастини",
    headers: {
      id: "ID",
      name: "Назва",
      quantity: "Кількість",
      price: "Ціна (грн)",
      unit: "Одиниця виміру",
      createdAt: "Дата додавання",
    },
  },
};
