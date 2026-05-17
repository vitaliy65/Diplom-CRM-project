import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { setSelectedTicketId } from "@/store/slices/selected-ticket-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Ticket } from "@/lib/types";

export default function TicketSelectionAnimation({
  ticket,
}: {
  ticket: Ticket;
}) {
  const selectedTicketId = useAppSelector((s) => s.selectedTicket.id);
  const dispatch = useAppDispatch();

  return (
    <AnimatePresence mode="wait">
      {selectedTicketId && ticket.id === selectedTicketId && (
        <>
          <motion.div
            key={"selected-" + ticket.id}
            id="selected-ticket"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.75, ease: "easeOut" }}
            exit={{
              opacity: 0,
              scale: 0.9,
              transition: { delay: 2, duration: 0.75, ease: "easeOut" },
            }}
            onAnimationComplete={() => dispatch(setSelectedTicketId(""))}
            className="absolute  box-border top-0 right-0 -z-10 w-full h-full overflow-hidden rounded-2xl"
          >
            <div className="border-amber-700 border-b-32 rounded-2xl w-full h-full"></div>
          </motion.div>
          <motion.div
            key={"selected-" + ticket.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.75, ease: "easeOut" }}
            exit={{
              opacity: 0,
              scale: 1.06,
              transition: { delay: 2, duration: 0.75, ease: "easeOut" },
            }}
            onAnimationComplete={() => dispatch(setSelectedTicketId(""))}
            className="absolute box-border top-0 right-0 z-10 w-full h-full overflow-hidden rounded-2xl"
          >
            <div className="border-amber-700 border-4 rounded-2xl w-full h-full"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
