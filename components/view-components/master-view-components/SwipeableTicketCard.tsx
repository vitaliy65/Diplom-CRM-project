import { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
  AnimatePresence,
} from "framer-motion";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changeTicketStatus, updateTicket } from "@/store/slices/tickets-slice";
import { TicketStatus, Ticket, Comment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Phone } from "lucide-react";
import { ServiceList } from "./card/ServiceList";
import { CommentsList } from "./card/CommentsList";
import { CardActions } from "./card/CardActions";
import { CardHeader } from "./card/CardHeader";

// --- Основной компонент ---

export function SwipeableTicketCard({
  ticket,
  index,
}: {
  ticket: Ticket;
  index: number;
}) {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [comment, setComment] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const services = useAppSelector((s) => s.services.items);
  const currentUser = useAppSelector((s) => s.auth.user);

  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [0, 100],
    ["oklch(0.12 0.008 270)", "oklch(0.78 0.2 155 / 0.2)"],
  );
  const checkOpacity = useTransform(x, [0, 100], [0, 1]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x > 100) {
      void dispatch(
        changeTicketStatus({
          id: ticket.id,
          oldStatus: status,
          newStatus: "ready",
        }),
      );
      setIsCompleted(true);
      setTimeout(() => setIsCompleted(false), 2000);
    }
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    void dispatch(
      changeTicketStatus({ id: ticket.id, oldStatus: status, newStatus }),
    );
    toast.success("Статус оновлено");
    setStatus(newStatus);
  };

  // Handler for adding comments (updates ticket's comments array)
  const handleAddComment = async () => {
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;

    // Compose new comment object with type safety (Comment from types)
    const userInfo = {
      id: currentUser?.id ?? "me",
      name: currentUser?.name ?? "Майстер",
    };

    // Prepare new comment array: always as array of Comment
    const existing: Comment[] = Array.isArray(ticket.comments)
      ? ticket.comments.filter(
          (c: any): c is Comment =>
            c &&
            typeof c === "object" &&
            typeof c.text === "string" &&
            typeof c.createdAt === "string" &&
            typeof c.authorId === "string" &&
            typeof c.authorName === "string",
        )
      : [];

    const nextComments: Comment[] = [
      ...existing,
      {
        text: trimmedComment,
        createdAt: new Date().toISOString(),
        authorId: userInfo.id,
        authorName: userInfo.name,
      },
    ];

    // Call the updateTicket thunk with correct type
    await dispatch(
      updateTicket({ id: ticket.id, data: { comments: nextComments } }),
    );
    setComment("");
    toast.success("Коментар додано");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ delay: index * 0.05 }}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Swipe Background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end px-6 rounded-xl"
        style={{ background }}
      >
        <motion.div style={{ opacity: checkOpacity }}>
          <CheckCircle2 className="h-8 w-8 text-glow-green" />
        </motion.div>
      </motion.div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "relative bento-card hover:scale-100! cursor-grab active:cursor-grabbing",
          ticket.slaViolation && "border-l-2 border-l-glow-red",
        )}
      >
        {/* SLA Warning */}
        {ticket.slaViolation && (
          <motion.div
            className="absolute right-3 top-3"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow-red opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-glow-red" />
            </span>
          </motion.div>
        )}

        {/* Completed Overlay */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-glow-green/20 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-glow-green">
                <CheckCircle2 className="h-6 w-6" />
                <span className="font-medium">Готово!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <CardHeader
          ticket={ticket}
          status={status}
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
        />

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                {/* Client Contact */}
                <a
                  href={`tel:${ticket.clientPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Зателефонувати
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.clientPhone}
                    </p>
                  </div>
                </a>

                {/* Problem */}
                <div className="rounded-xl bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Проблема:
                  </p>
                  <p className="text-sm text-foreground">{ticket.problem}</p>
                </div>

                {/* Services Card List */}
                <ServiceList
                  services={services.filter((s) =>
                    ticket.services.includes(s.id),
                  )}
                />

                {/* Comments */}
                <CommentsList comments={ticket.comments} />

                {/* Actions */}
                <CardActions
                  status={status}
                  onStatusChange={handleStatusChange}
                  comment={comment}
                  setComment={setComment}
                  onAddComment={handleAddComment}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
