import { Ticket, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight, Wrench } from "lucide-react";
import { StatusDot } from "../StatusDot";

export function CardHeader({
  ticket,
  status,
  expanded,
  onToggle,
}: {
  ticket: Ticket;
  status: TicketStatus;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="w-full p-4 flex items-center justify-between"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            status === "in-progress" ? "bg-glow-blue/20" : "bg-glow-green/20",
          )}
        >
          {status === "in-progress" ? (
            <Wrench className="h-5 w-5 text-glow-blue" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-glow-green" />
          )}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {ticket.id}
            </span>
            <StatusDot status={status} />
          </div>
          <p className="font-medium text-foreground">{ticket.device}</p>
          <p className="text-xs text-muted-foreground">{ticket.clientName}</p>
        </div>
      </div>
      <ChevronRight
        className={cn(
          "h-5 w-5 text-muted-foreground transition-transform",
          expanded && "rotate-90",
        )}
      />
    </button>
  );
}
