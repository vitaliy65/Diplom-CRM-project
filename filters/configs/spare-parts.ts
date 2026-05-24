import { SpareParts } from "@/lib/types";
import { EntityFilterSortConfig } from "../types";

export const sparePartsConfig: EntityFilterSortConfig<SpareParts> = {
  filters: [
    {
      field: "name",
      label: "Назва",
      type: "text",
      operator: "contains",
    },
    {
      field: "description",
      label: "Опис",
      type: "text",
      operator: "contains",
    },
    {
      field: "count",
      label: "Залишок на складі",
      type: "number-range",
      operator: "between",
    },
    {
      field: "priceForOne",
      label: "Ціна за одиницю",
      type: "number-range",
      operator: "between",
    },
  ],

  sorts: [
    { field: "name", label: "Назва (А→Я)" },
    { field: "count", label: "Залишок" },
    { field: "priceForOne", label: "Ціна" },
  ],

  defaultSort: { field: "name", direction: "asc" },
};
