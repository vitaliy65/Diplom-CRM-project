import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TicketCard } from "./TicketCard";
import { Ticket, TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AssignMasterModal } from "./AssignMasterModal";

const kanbanColumns: {
  status: TicketStatus;
  label: string;
  dotClass: string;
}[] = [
  { status: "received", label: "Прийнято", dotClass: "bg-muted-foreground" },
  {
    status: "in-progress",
    label: "В роботі",
    dotClass: "bg-glow-blue dot-glow-blue",
  },
  {
    status: "ready",
    label: "Готово",
    dotClass: "bg-glow-green dot-glow-green",
  },
  { status: "delivered", label: "Видано", dotClass: "bg-glow-purple" },
];

export function KanbanBoard({ tickets }: { tickets: Ticket[] }) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const handleCardClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAssignModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4"
      >
        {kanbanColumns.map((column, columnIndex) => {
          const columnTickets = tickets.filter(
            (t) => t.status === column.status,
          );
          return (
            <motion.div
              key={column.status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: columnIndex * 0.1 }}
              className="space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("h-2 w-2 rounded-full", column.dotClass)}
                  />
                  <h3 className="font-medium text-sm md:text-base text-foreground">
                    {column.label}
                  </h3>
                </div>
                <span className="flex h-5 md:h-6 min-w-5 md:min-w-6 items-center justify-center rounded-full bg-secondary/50 px-1.5 md:px-2 text-[10px] md:text-xs text-muted-foreground">
                  {columnTickets.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="space-y-2 md:space-y-3 min-h-[200px] md:min-h-[400px]">
                <AnimatePresence mode="wait">
                  {columnTickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleCardClick(ticket)}
                      role="button"
                      className="relative z-10"
                    >
                      <TicketCard ticket={ticket} index={index} />
                    </div>
                  ))}
                </AnimatePresence>
                {columnTickets.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-24 md:h-32 items-center justify-center rounded-xl border border-dashed border-border text-xs md:text-sm text-muted-foreground"
                  >
                    Немає заявок
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      {selectedTicket && (
        <AssignMasterModal
          open={assignModalOpen}
          onOpenChange={(open) => {
            setAssignModalOpen(open);
            if (!open) setSelectedTicket(null);
          }}
          ticket={selectedTicket}
        />
      )}
    </>
  );
}
