import { Service } from "@/lib/types";
import { ListChecks } from "lucide-react";

export function ServiceList({ services }: { services: Service[] }) {
  if (!services?.length) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <ListChecks className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-semibold">
          Сервіси
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-xl bg-secondary/40 border border-secondary/60 px-3 py-2 flex flex-col min-w-[120px] max-w-full shadow-sm"
          >
            <span className="text-sm font-medium text-foreground">
              {service.name}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                Базова:&nbsp;
                <span className="text-foreground font-mono">
                  {service.base_price}₴
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Фінальна:&nbsp;
                <span className="text-foreground font-mono">
                  {service.final_price}₴
                </span>
              </span>
            </div>
            {service.discount > 0 && (
              <span className="text-xs text-glow-green">
                Знижка: -{service.discount}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
