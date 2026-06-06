"use client";

import { LayoutGrid, Table2 } from "lucide-react";

export type TicketViewStyle = "table" | "kanban";

interface ViewStyleSwitchProps {
  value: TicketViewStyle;
  onChange: (value: TicketViewStyle) => void;
}

const options: { value: TicketViewStyle; label: string; Icon: typeof Table2 }[] = [
  { value: "table", label: "Таблиця", Icon: Table2 },
  { value: "kanban", label: "Канбан", Icon: LayoutGrid },
];

export default function ViewStyleSwitch({
  value,
  onChange,
}: ViewStyleSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Стиль перегляду"
      className="inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-muted/50 p-1"
    >
      {options.map(({ value: optValue, label, Icon }) => {
        const active = value === optValue;
        return (
          <button
            key={optValue}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(optValue)}
            className={
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
              (active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            <Icon className="h-4 w-4" />
            <span className="max-sm:sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
