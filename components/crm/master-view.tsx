"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wrench, CheckCircle2, ChevronRight } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectTickets } from "@/store/slices/tickets-slice";
import { selectCurrentUser } from "@/store/slices/auth-slice";
import { SwipeableTicketCard } from "../master-view-components/SwipeableTicketCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
export function MasterView() {
  const currentUser = useAppSelector(selectCurrentUser);
  const tickets = useAppSelector(selectTickets);
  const assignedTickets = tickets
    .filter((t) => t.masterId === currentUser?.id)
    .filter((t) => t.status !== "delivered");

  const inProgress = assignedTickets.filter(
    (t) => t.status === "in-progress",
  ).length;
  const ready = assignedTickets.filter((t) => t.status === "ready").length;
  const slaViolations = assignedTickets.filter((t) => t.slaViolation).length;

  return (
    <motion.div
      className="min-h-screen px-4 pb-8 pt-24 general-view-settings"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-2xl md:pl-16">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Робоче місце</h1>
          </div>
          <p className="text-muted-foreground">Ваші призначені заявки</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bento-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-glow-blue dot-glow-blue" />
              <span className="text-3xl font-bold text-foreground">
                {inProgress}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">В роботі</p>
          </div>
          <div className="bento-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-glow-green dot-glow-green" />
              <span className="text-3xl font-bold text-foreground">
                {ready}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Готово</p>
          </div>
          <div className="bento-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-glow-red dot-glow-red" />
              <span className="text-3xl font-bold text-foreground">
                {slaViolations}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">SLA</p>
          </div>
        </motion.div>

        {/* Swipe Hint */}
        <motion.div variants={itemVariants} className="mb-4 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <ChevronRight className="h-3 w-3" />
            Свайп вправо для швидкого завершення
          </p>
        </motion.div>

        {/* Tickets List */}
        <div className="space-y-3">
          <AnimatePresence>
            {assignedTickets.map((ticket, index) => (
              <SwipeableTicketCard
                key={ticket.id}
                ticket={ticket}
                index={index}
              />
            ))}
          </AnimatePresence>

          {assignedTickets.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="bento-card p-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-glow-green/20 mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-glow-green" />
              </div>
              <p className="text-lg font-medium text-foreground">
                Все виконано!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Немає призначених заявок
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
