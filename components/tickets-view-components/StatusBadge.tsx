import { TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: TicketStatus }) {
    const config: Record<TicketStatus, { label: string; dotClass: string }> = {
      received: { label: "Прийнято", dotClass: "bg-muted-foreground" },
      "in-progress": { label: "В роботі", dotClass: "bg-glow-blue dot-glow-blue" },
      ready: { label: "Готово", dotClass: "bg-glow-green dot-glow-green" },
      delivered: { label: "Видано", dotClass: "bg-glow-purple" },
    }
  
    const { label, dotClass } = config[status]
  
    return (
      <span className="inline-flex items-center gap-1 md:gap-1.5 rounded-full bg-secondary/50 px-1.5 md:px-2.5 py-0.5 md:py-1 text-[10px] md:text-xs font-medium text-foreground">
        <span className={cn("h-1 w-1 md:h-1.5 md:w-1.5 rounded-full", dotClass)} />
        <span className="hidden sm:inline">{label}</span>
      </span>
    )
  }