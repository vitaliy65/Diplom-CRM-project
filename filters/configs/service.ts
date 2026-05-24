import { Service } from "@/lib/types";
import { EntityFilterSortConfig } from "../types";

export const serviceConfig: EntityFilterSortConfig<Service> = {
  filters: [
    {
      field: "name",
      label: "Назва",
      type: "text",
      operator: "contains",
    },
    {
      field: "base_price",
      label: "Базова ціна",
      type: "number-range",
      operator: "between",
    },
    {
      field: "final_price",
      label: "Фінальна ціна",
      type: "number-range",
      operator: "between",
    },
    {
      field: "discount",
      label: "Знижка (%)",
      type: "number-range",
      operator: "between",
    },
  ],

  sorts: [
    { field: "name", label: "Назва (А→Я)" },
    { field: "base_price", label: "Базова ціна" },
    { field: "final_price", label: "Фінальна ціна" },
    { field: "discount", label: "Знижка" },
  ],

  defaultSort: { field: "name", direction: "asc" },
};
