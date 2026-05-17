import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Clock, Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Ticket } from "@/lib/types";
import { AssignMasterModal } from "./AssignMasterModal";

export function TicketCard({ ticket, index }: { ticket: Ticket; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Открываем модалку при клике на карточку
  const handleOpenModal = (e: React.MouseEvent<HTMLDivElement>) => {
    // Игнорируем если клик по кнопкам внутри (например, в будущем)
    setModalOpen(true);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative cursor-pointer rounded-xl border border-border/50 bg-card/80 p-3 md:p-4 backdrop-blur-sm transition-all duration-300",
          isHovered && "border-primary/30 shadow-lg shadow-primary/5",
          ticket.slaViolation && "border-l-2 border-l-glow-red"
        )}
        whileHover={{ y: -2 }}
        onClick={handleOpenModal}
      >
        {/* SLA Warning Glow */}
        {ticket.slaViolation && (
          <motion.div
            className="absolute -right-1 -top-1"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow-red opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-glow-red" />
            </span>
          </motion.div>
        )}

        {/* Card Content */}
        <div className="space-y-2 md:space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <span className="font-mono text-[10px] md:text-xs text-muted-foreground">{ticket.id}</span>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="hidden md:flex items-center gap-1"
            >
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                <Monitor className="h-3 w-3" />
              </Button>
            </motion.div>
          </div>

          {/* Client & Device */}
          <div>
            <p className="font-medium text-sm md:text-base text-foreground">{ticket.clientName}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
              <Smartphone className="h-3 w-3" />
              <span className="truncate">{ticket.device}</span>
            </div>
          </div>

          {/* Problem */}
          <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">{ticket.problem}</p>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/30 pt-2 md:pt-3">
            {ticket.masterName ? (
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-primary/20 text-[8px] md:text-[10px] font-medium text-primary">
                  {ticket.masterName.charAt(0)}
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground truncate max-w-[60px] md:max-w-none">{ticket.masterName}</span>
              </div>
            ) : (
              <span className="text-[10px] md:text-xs text-muted-foreground">Не призначено</span>
            )}

            <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{ticket.createdAt}</span>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Модальное окно для выбора мастера */}
      <AssignMasterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ticket={ticket}
      />
    </>
  );
}