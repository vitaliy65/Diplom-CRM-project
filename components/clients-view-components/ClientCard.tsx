import { Client } from "@/lib/types";
import { ChevronRight, ClipboardList, Mail } from "lucide-react";
import { motion } from "framer-motion";

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }
  
export function ClientCard({
    client,
    index,
    onClick,
  }: {
    client: Client
    index: number
    onClick: () => void
  }) {
    return (
      <motion.div
        variants={itemVariants}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.03 }}
        onClick={onClick}
        className="bento-card card-lift p-4 cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/30 to-primary/10">
              <span className="text-sm font-bold text-primary">
                {client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.phone}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
  
        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-[150px]">{client.email}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-2 py-1">
            <ClipboardList className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground font-medium">{client.ticketCount}</span>
          </div>
        </div>
      </motion.div>
    )
  }