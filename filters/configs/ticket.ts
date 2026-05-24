import { statusLabels, Ticket } from "@/lib/types";
import { EntityFilterSortConfig } from "../types";

export const ticketConfig: EntityFilterSortConfig<Ticket> = {
  filters: [
    {
      field: "status",
      label: "Статус",
      type: "multi-select",
      operator: "in",
      options: Object.entries(statusLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      field: "clientName",
      label: "Клієнт",
      type: "text",
      operator: "contains",
    },
    {
      field: "device",
      label: "Пристрій",
      type: "text",
      operator: "contains",
    },
    {
      field: "masterName",
      label: "Майстер",
      type: "text",
      operator: "contains",
    },
    {
      field: "slaViolation",
      label: "SLA порушено",
      type: "boolean",
      operator: "boolean",
    },
  ],

  sorts: [
    { field: "createdAt", label: "Дата створення" },
    { field: "readyAt", label: "Дата готовності" },
    { field: "clientName", label: "Клієнт (А→Я)" },
    { field: "status", label: "Статус" },
  ],

  defaultSort: { field: "createdAt", direction: "desc" },
};
