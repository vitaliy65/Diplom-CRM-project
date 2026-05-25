import type { UsedPartsTicket } from "@/lib/types";
import { Package } from "lucide-react";

export function UsedPartsList({ parts }: { parts: UsedPartsTicket[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-semibold">
          Потрібні запчастини
        </span>
      </div>
      {!parts?.length ? (
        <p className="text-xs text-muted-foreground rounded-xl bg-secondary/30 px-3 py-2">
          Запчастини для цієї заявки не вказані
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {parts.map((part) => (
            <div
              key={part.id}
              className="rounded-xl bg-secondary/40 border border-secondary/60 px-3 py-2 flex flex-col min-w-[120px] max-w-full shadow-sm"
            >
              <span className="text-sm font-medium text-foreground">
                {part.name}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Кількість:{" "}
                <span className="text-foreground font-mono font-medium">
                  {part.quantity} шт
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
