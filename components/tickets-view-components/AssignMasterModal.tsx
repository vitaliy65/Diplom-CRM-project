import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Calendar, CheckIcon, Phone, User, ListChecks } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toFullDateTime } from "@/lib/time";
import { Ticket, statusLabels, TicketStatus, UserProfile } from "@/lib/types";
import { useTicketInfoModal } from "@/hooks/use-ticket-info-modal";

type AssignMasterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
};

type GridRow = {
  label: React.ReactNode;
  value: React.ReactNode;
};

export function AssignMasterModal({
  open,
  onOpenChange,
  ticket,
}: AssignMasterModalProps) {
  const isMobile = useIsMobile();

  // Get all ticket meta and UI helpers from the hook
  const {
    selectedMasterId,
    setSelectedMasterId,
    activeMasters,
    saving,
    handleAssign,
    handleDeliver,
    getDisplay,
    servicesArray,
    commentsArray,
    truncateText,
    MOBILE_LENGTHS,
    users,
  } = useTicketInfoModal({
    open,
    ticket,
    onOpenChange,
  });

  // services string (already formatted for UI)
  const servicesString =
    Array.isArray(servicesArray) && servicesArray.length > 0 ? (
      <ul className="list-disc pl-4">
        {servicesArray.map((service, idx) => (
          <li key={idx} className="break-words text-xs">
            {service}
          </li>
        ))}
      </ul>
    ) : null;

  // comments block
  const commentsBlock =
    Array.isArray(commentsArray) && commentsArray.length > 0 ? (
      <div className="rounded bg-accent/20 p-2 mt-2 col-span-2">
        <span className="block text-xs text-muted-foreground mb-1">
          Коментарі:
        </span>
        <ul className="list-disc pl-5 text-xs text-foreground space-y-1 max-h-[110px] overflow-auto">
          {commentsArray.map((c, i) => (
            <li key={i} className="break-words">
              {c}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  // grid row data
  const gridRows: GridRow[] = [
    {
      label: (
        <span className="flex items-center gap-1">
          <User className="h-4 w-4 text-glow-purple min-w-4" />
          Клієнт:
        </span>
      ),
      value: getDisplay(ticket.clientName, MOBILE_LENGTHS.clientName),
    },
    {
      label: (
        <span className="flex items-center gap-1">
          <Phone className="h-4 w-4 text-primary min-w-4" />
          Телефон:
        </span>
      ),
      value: (
        <a
          href={`tel:${ticket.clientPhone.replace(/\s/g, "")}`}
          className="underline text-blue-900/90 hover:text-blue-600"
          tabIndex={0}
          style={{ wordBreak: "break-word" }}
        >
          {getDisplay(ticket.clientPhone, MOBILE_LENGTHS.phone)}
        </a>
      ),
    },
    {
      label: "Пристрій:",
      value: getDisplay(ticket.device, MOBILE_LENGTHS.device),
    },
    {
      label: "Проблема:",
      value: (
        <span className="text-xs">
          {getDisplay(ticket.problem, MOBILE_LENGTHS.problem)}
        </span>
      ),
    },
    ...(servicesString
      ? [
          {
            label: (
              <span className="flex items-center gap-1">
                <ListChecks className="h-4 w-4 text-green-700 min-w-4" />
                Сервіси:
              </span>
            ),
            value: servicesString,
          },
        ]
      : []),
    {
      label: (
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Створено:
        </span>
      ),
      value: (
        <span className="font-mono text-muted-foreground">
          {toFullDateTime(ticket.createdAt)}
        </span>
      ),
    },
    ...(ticket.readyAt
      ? [
          {
            label: (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Готово:
              </span>
            ),
            value: (
              <span className="font-mono text-emerald-800 dark:text-emerald-400">
                {toFullDateTime(ticket.readyAt)}
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`bg-background/95 max-w-lg shadow-xl border border-border p-0 overflow-hidden ${isMobile ? "rounded-lg max-w-[98vw] p-0" : ""}`}
      >
        <DialogHeader
          className={isMobile ? "px-3 pt-4 pb-2" : "px-6 pt-6 pb-2"}
        >
          <DialogTitle
            className={`font-semibold tracking-wide ${isMobile ? "text-lg" : "text-xl"}`}
          >
            Призначити майстра
          </DialogTitle>
        </DialogHeader>

        {/* Ticket meta */}
        <div
          className={
            isMobile ? "w-full px-3 pb-1 pt-1" : "w-full px-6 pb-1 pt-2"
          }
        >
          <div
            className={`bento-card rounded-xl border bg-muted/50 ${isMobile ? "p-3" : "p-4"} space-y-3`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] text-muted-foreground bg-secondary/60 rounded-md px-2 py-0.5">
                  #{ticket.id}
                </span>
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 rounded text-primary font-semibold">
                  {statusLabels[ticket.status as TicketStatus]}
                </span>
              </div>
              {ticket.slaViolation && (
                <span className="text-xs text-destructive font-bold border-destructive border px-2 py-0.5 rounded">
                  SLA порушено
                </span>
              )}
            </div>
            {/* GRID PART */}
            <div
              className={
                "grid gap-y-1 items-baseline " +
                (isMobile
                  ? "grid-cols-[auto_1fr] gap-x-2"
                  : "grid-cols-[120px_2fr] gap-x-6 gap-y-4")
              }
            >
              {gridRows.map((row, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-muted-foreground text-xs whitespace-nowrap flex items-center gap-1">
                    {row.label}
                  </span>
                  <span className="font-medium text-foreground break-words text-left text-sm">
                    {row.value}
                  </span>
                </React.Fragment>
              ))}
              {commentsBlock}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1.5px] bg-border my-4 mx-0" />

        {/* Master assign */}
        <div className={`flex flex-col gap-2 ${isMobile ? "px-3" : "px-6"}`}>
          <label className="text-sm font-medium mb-1" htmlFor="masters">
            Майстер:
          </label>
          {activeMasters.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Немає доступних майстрів
            </span>
          ) : (
            <select
              id="masters"
              className={
                "w-full border rounded text-sm bg-background " +
                "focus:outline-none focus:ring-2 focus:ring-primary " +
                (isMobile ? "p-2.5" : "p-2")
              }
              value={selectedMasterId ?? ""}
              onChange={(e) => {
                setSelectedMasterId(
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              disabled={saving}
            >
              <option value="">Не призначено</option>
              {activeMasters.map((master) => (
                <option key={master.id} value={master.id}>
                  {isMobile ? truncateText(master.name, 22) : master.name} (
                  {isMobile ? truncateText(master.email, 24) : master.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <DialogFooter
          className={`mt-6 pb-6 flex justify-between ${isMobile ? "px-3" : "px-6"}`}
        >
          <Button
            className="bg-purple-800/75 hover:bg-purple-700/75"
            onClick={handleDeliver}
            disabled={saving || ticket.status === "delivered"}
          >
            {ticket.status === "delivered" ? (
              <span className="flex gap-1 items-center">
                <CheckIcon /> Видано
              </span>
            ) : (
              "Видати"
            )}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleAssign}
              disabled={saving || selectedMasterId === ticket.masterId}
            >
              Зберегти
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
