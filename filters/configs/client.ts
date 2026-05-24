import { Client } from "@/lib/types";
import { EntityFilterSortConfig } from "../types";

export const clientConfig: EntityFilterSortConfig<Client> = {
  filters: [
    {
      field: "name",
      label: "Ім'я",
      type: "text",
      operator: "contains",
    },
    {
      field: "phone",
      label: "Телефон",
      type: "text",
      operator: "contains",
    },
    {
      field: "email",
      label: "Email",
      type: "text",
      operator: "contains",
    },
    {
      field: "ticketCount",
      label: "Кількість заявок",
      type: "number-range",
      operator: "between",
    },
  ],

  sorts: [
    { field: "name", label: "Ім'я (А→Я)" },
    { field: "ticketCount", label: "Кількість заявок" },
    { field: "email", label: "Email" },
  ],

  defaultSort: { field: "name", direction: "asc" },
};
