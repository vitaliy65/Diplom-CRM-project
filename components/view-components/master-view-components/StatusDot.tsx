import { TicketStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export function StatusDot({ status }: { status: TicketStatus }) {
    const dotClass =
      status === "in-progress"
        ? "bg-glow-blue dot-glow-blue"
        : status === "ready"
        ? "bg-glow-green dot-glow-green"
        : "bg-muted-foreground"
  
    return <span className={cn("h-2 w-2 rounded-full", dotClass)} />
  }