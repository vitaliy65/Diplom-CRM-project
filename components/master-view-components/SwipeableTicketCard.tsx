import { useState } from "react"
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useAppDispatch } from "@/store/hooks"
import { changeTicketStatus } from "@/store/slices/tickets-slice"
import { TicketStatus } from "@/lib/types"
import { Ticket } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle2, Wrench, Phone, MessageSquare, ChevronRight } from "lucide-react"
import { StatusDot } from "./StatusDot"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export function SwipeableTicketCard({ ticket, index }: { ticket: Ticket; index: number }) {
    const dispatch = useAppDispatch()
    const [expanded, setExpanded] = useState(false)
    const [status, setStatus] = useState<TicketStatus>(ticket.status)
    const [comment, setComment] = useState("")
    const [isCompleted, setIsCompleted] = useState(false)
  
    const x = useMotionValue(0)
    const background = useTransform(
      x,
      [0, 100],
      ["oklch(0.12 0.008 270)", "oklch(0.78 0.2 155 / 0.2)"]
    )
    const checkOpacity = useTransform(x, [0, 100], [0, 1])
  
    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x > 100) {
        void dispatch(changeTicketStatus({ id: ticket.id, oldStatus: status, newStatus: "ready" }))
        setIsCompleted(true)
        setTimeout(() => setIsCompleted(false), 2000)
      }
    }
  
    const handleStatusChange = (newStatus: TicketStatus) => {
      void dispatch(changeTicketStatus({ id: ticket.id, oldStatus: status, newStatus }))
      toast.success("Статус оновлено")
      setStatus(newStatus)
    }
  
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
            "relative bento-card cursor-grab active:cursor-grabbing",
            ticket.slaViolation && "border-l-2 border-l-glow-red"
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
          <button
            className="w-full p-4 flex items-center justify-between"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  status === "in-progress"
                    ? "bg-glow-blue/20"
                    : "bg-glow-green/20"
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
                  <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                  <StatusDot status={status} />
                </div>
                <p className="font-medium text-foreground">{ticket.device}</p>
                <p className="text-xs text-muted-foreground">{ticket.clientName}</p>
              </div>
            </div>
            <ChevronRight
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                expanded && "rotate-90"
              )}
            />
          </button>
  
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
                      <p className="text-sm font-medium text-foreground">Зателефонувати</p>
                      <p className="text-xs text-muted-foreground">{ticket.clientPhone}</p>
                    </div>
                  </a>
  
                  {/* Problem */}
                  <div className="rounded-xl bg-secondary/30 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Проблема:</p>
                    <p className="text-sm text-foreground">{ticket.problem}</p>
                  </div>
  
                  {/* Comments */}
                  {ticket.comments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Коментарі:</p>
                      {ticket.comments.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-xl bg-secondary/30 p-3 text-sm"
                        >
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-foreground">{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
  
                  {/* Actions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Статус:</span>
                      <Select
                        value={status}
                        onValueChange={(v) => handleStatusChange(v as TicketStatus)}
                      >
                        <SelectTrigger className="flex-1 bg-secondary/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-progress">В роботі</SelectItem>
                          <SelectItem value="ready">Готово</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
  
                    <Textarea
                      placeholder="Додати коментар..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[80px] bg-secondary/50 border-border/50"
                    />
  
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 gap-2"
                      disabled={!comment.trim()}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Додати коментар
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    )
  }