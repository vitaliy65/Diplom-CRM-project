import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Ticket, UserProfile, statusLabels } from "@/lib/types";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTicket,
  selectTicketsSaving,
} from "@/store/slices/tickets-slice";
import { AppDispatch, RootState } from "@/store";
import { Calendar, CheckCheckIcon, CheckIcon, Phone, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toFullDateTime } from "@/lib/time";

type AssignMasterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
};

/** Усечение текста, если его слишком много */
function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

/** Максимальные длины для различных полей в mob режиме */
const MOBILE_LENGTHS = {
  clientName: 24,
  phone: 22,
  device: 26,
  problem: 72,
  comment: 70,
};

export function AssignMasterModal({
  open,
  onOpenChange,
  ticket,
}: AssignMasterModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(
    ticket.masterId,
  );
  const users = useSelector(
    (state: RootState) => state.users.items as UserProfile[],
  );
  const saving = useSelector(selectTicketsSaving);
  const isMobile = useIsMobile();

  // Only active masters
  const activeMasters = users.filter((u) => u.role === "master" && u.active);

  useEffect(() => {
    if (open) setSelectedMasterId(ticket.masterId);
  }, [open, ticket.masterId]);

  const handleAssign = async () => {
    if (selectedMasterId === ticket.masterId) {
      onOpenChange(false);
      return;
    }
    const selectedMaster = users.find((u) => u.id === selectedMasterId);
    await dispatch(
      updateTicket({
        id: ticket.id,
        data: {
          masterId: selectedMaster ? selectedMaster.id : null,
          masterName: selectedMaster ? selectedMaster.name : null,
        },
      }),
    );
    onOpenChange(false);
  };

  // Кнопка "Видати": поменять статус на "delivered"
  const handleDeliver = async () => {
    if (ticket.status === "delivered") {
      onOpenChange(false);
      return;
    }
    await dispatch(
      updateTicket({
        id: ticket.id,
        data: {
          status: "delivered",
        },
      }),
    );
    onOpenChange(false);
  };

  // Стили для адаптива: компактность для мобилок
  const infoRow =
    "flex items-center gap-2 py-1 text-sm px-2 rounded hover:bg-secondary/30 transition " +
    (isMobile ? "min-h-[36px]" : "");
  const infoValue =
    "font-medium text-foreground break-words flex-1 text-right " +
    (isMobile ? "text-[15px] max-w-[62vw] leading-tight" : "text-base");
  const infoLabel =
    "text-muted-foreground text-xs whitespace-nowrap flex gap-1 items-center" +
    (isMobile ? " max-w-[32vw] truncate" : "");

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
        {/* Ticket Info */}
        <div
          className={
            isMobile ? "w-full px-3 pb-1 pt-1" : "w-full px-6 pb-1 pt-2"
          }
        >
          <div
            className={`bento-card rounded-xl border bg-muted/50 space-y-3 ${isMobile ? "p-3" : "p-4"}`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] text-muted-foreground bg-secondary/60 rounded-md px-2 py-0.5">
                  #{ticket.id}
                </span>
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 rounded text-primary font-semibold">
                  {statusLabels[ticket.status]}
                </span>
              </div>
              {ticket.slaViolation && (
                <span className="text-xs text-destructive font-bold border-destructive border px-2 py-0.5 rounded">
                  SLA порушено
                </span>
              )}
            </div>
            <div className="space-y-2">
              {/* Client */}
              <div className={infoRow}>
                <User className="h-4 w-4 text-glow-purple min-w-4" />
                <span className={infoLabel}>Клієнт:</span>
                <span className={infoValue}>
                  {isMobile
                    ? truncateText(ticket.clientName, MOBILE_LENGTHS.clientName)
                    : ticket.clientName}
                </span>
              </div>
              {/* Phone */}
              <div className={infoRow}>
                <Phone className="h-4 w-4 text-primary min-w-4" />
                <span className={infoLabel}>Телефон:</span>
                <a
                  href={`tel:${ticket.clientPhone.replace(/\s/g, "")}`}
                  className={
                    infoValue +
                    " underline text-blue-900/90 hover:text-blue-600"
                  }
                  tabIndex={0}
                  style={{ wordBreak: "break-word" }}
                >
                  {isMobile
                    ? truncateText(ticket.clientPhone, MOBILE_LENGTHS.phone)
                    : ticket.clientPhone}
                </a>
              </div>
              {/* Device */}
              <div className={infoRow}>
                <span className={infoLabel}>Пристрій:</span>
                <span className={infoValue}>
                  {isMobile
                    ? truncateText(ticket.device, MOBILE_LENGTHS.device)
                    : ticket.device}
                </span>
              </div>
              {/* Problem */}
              <div className={infoRow + " items-start"}>
                <span className={infoLabel}>Проблема:</span>
                <span className={infoValue + " text-xs text-left"}>
                  {isMobile
                    ? truncateText(ticket.problem, MOBILE_LENGTHS.problem)
                    : ticket.problem}
                </span>
              </div>
              {/* Dates */}
              <div className="flex flex-col gap-2 pt-1 py-1 px-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Створено:</span>
                  <span className="font-mono text-muted-foreground">
                    {toFullDateTime(ticket.createdAt)}
                  </span>
                </div>
                {ticket.readyAt && (
                  <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400">
                    <Calendar className="h-3 w-3" />
                    <span>Готово:</span>
                    <span className="font-mono">
                      {toFullDateTime(ticket.readyAt)}
                    </span>
                  </div>
                )}
              </div>
              {/* Comment */}
              {ticket.comments && ticket.comments.length > 0 && (
                <div className={"rounded bg-accent/20 p-2 mt-2"}>
                  <span className="block text-xs text-muted-foreground mb-1">
                    Коментарі:
                  </span>
                  <ul className="list-disc pl-5 text-xs text-foreground space-y-1 max-h-[110px] overflow-auto">
                    {ticket.comments.map((c, i) => (
                      <li key={i} className="break-words">
                        {isMobile ? truncateText(c, MOBILE_LENGTHS.comment) : c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
