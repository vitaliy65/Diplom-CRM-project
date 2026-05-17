import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Ticket } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function TicketsTable({ tickets }: { tickets: Ticket[] }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bento-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-muted-foreground">ID</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-muted-foreground">Клієнт</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-muted-foreground">Пристрій</th>
                <th className="hidden md:table-cell px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-muted-foreground">Проблема</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-muted-foreground">Майстер</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-muted-foreground">Статус</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, index) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group border-b border-border/30 transition-colors hover:bg-secondary/30"
                >
                  <td className="px-3 md:px-4 py-2 md:py-3 font-mono text-[10px] md:text-sm text-muted-foreground">{ticket.id}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <div>
                      <p className="font-medium text-xs md:text-base text-foreground">{ticket.clientName}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{ticket.clientPhone}</p>
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-foreground">{ticket.device}</td>
                  <td className="hidden md:table-cell max-w-xs px-3 md:px-4 py-2 md:py-3">
                    <p className="truncate text-xs md:text-sm text-muted-foreground">{ticket.problem}</p>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-foreground">{ticket.masterName || "—"}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <div className="flex items-center gap-1 md:gap-2">
                      {ticket.slaViolation && (
                        <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-glow-red" />
                      )}
                      <StatusBadge status={ticket.status} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    )
  }