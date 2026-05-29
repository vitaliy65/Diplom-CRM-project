"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Ticket } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTickets } from "@/store/slices/tickets-slice";
import { selectClients } from "@/store/slices/clients-slice";
import { SendStatus } from "@/components/view-components/send-email-view-components/StatusBadge";

// --- Импорт функции updateTicket (добавьте правильный путь если нужно) ---
import { updateTicket } from "@/store/slices/tickets-slice";

interface TicketRowState {
  ticket: Ticket;
  status: SendStatus;
}

async function sendEmail(ticket: Ticket): Promise<void> {
  const res = await fetch("/api/send-ticket-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticket),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? "Невідома помилка");
  }
}

export function useBroadcastEmail() {
  const allTickets = useAppSelector(selectTickets);
  const clients = useAppSelector(selectClients);
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<TicketRowState[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSendingAll, setIsSendingAll] = useState(false);

  const clientEmailMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c.email ?? ""])),
    [clients],
  );

  const readyTickets = useMemo(
    () =>
      allTickets
        .filter((t) => t.status === "ready")
        .map((t) => ({
          ...t,
          clientEmail: t.clientEmail ?? clientEmailMap.get(t.clientId) ?? "",
        })),
    [allTickets, clientEmailMap],
  );

  useEffect(() => {
    setRows(
      readyTickets.map((t) => ({
        ticket: t,
        status: t.isEmailDelivered ? "sent" : "idle",
      })),
    );
    setSelected(
      new Set(
        readyTickets
          .filter((t) => t.clientEmail && !t.isEmailDelivered)
          .map((t) => t.id),
      ),
    );
  }, [readyTickets]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.ticket.clientName?.toLowerCase().includes(q) ||
        r.ticket.device?.toLowerCase().includes(q) ||
        r.ticket.clientEmail?.toLowerCase().includes(q),
    );
  }, [rows, search]);

  function setRowStatus(id: string, status: SendStatus) {
    setRows((prev) =>
      prev.map((r) => (r.ticket.id === id ? { ...r, status } : r)),
    );
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const validInFiltered = filtered.filter(
    (r) => r.ticket.clientEmail && r.status === "idle",
  );
  const allFilteredSelected = validInFiltered.every((r) =>
    selected.has(r.ticket.id),
  );

  function toggleAll() {
    const ids = validInFiltered.map((r) => r.ticket.id);
    setSelected((prev) => {
      const next = new Set(prev);
      allFilteredSelected
        ? ids.forEach((id) => next.delete(id))
        : ids.forEach((id) => next.add(id));
      return next;
    });
  }

  const validSelected = rows.filter(
    (r) =>
      selected.has(r.ticket.id) && r.ticket.clientEmail && r.status === "idle",
  ).length;

  async function handleSendSelected() {
    const targets = rows.filter(
      (r) =>
        selected.has(r.ticket.id) &&
        r.ticket.clientEmail &&
        r.status === "idle",
    );
    if (!targets.length) return;

    setIsSendingAll(true);
    let sentCount = 0;
    await Promise.all(
      targets.map(async ({ ticket }) => {
        setRowStatus(ticket.id, "sending");
        try {
          await sendEmail(ticket);

          await dispatch(
            updateTicket({
              id: ticket.id,
              data: { isEmailDelivered: true },
            }),
          );
          setRowStatus(ticket.id, "sent");
          sentCount++;
        } catch {
          setRowStatus(ticket.id, "error");
        }
      }),
    );
    setIsSendingAll(false);
    toast.success(`Надіслано ${sentCount} з ${targets.length} листів`);
  }

  async function handleSendOne(ticket: Ticket) {
    setRowStatus(ticket.id, "sending");
    try {
      await sendEmail(ticket);
      await dispatch(
        updateTicket({
          id: ticket.id,
          data: { isEmailDelivered: true },
        }),
      );
      setRowStatus(ticket.id, "sent");
      toast.success(`Лист надіслано на ${ticket.clientEmail}`);
    } catch (err) {
      setRowStatus(ticket.id, "error");
      toast.error(err instanceof Error ? err.message : "Помилка надсилання");
    }
  }

  const stats = useMemo(() => {
    const total = rows.length;
    const withEmail = rows.filter((r) => r.ticket.clientEmail).length;
    const sent = rows.filter(
      (r) => r.ticket.isEmailDelivered || r.status === "sent",
    ).length;
    const noEmail = total - withEmail;
    return { total, withEmail, sent, noEmail };
  }, [rows]);

  return {
    search,
    setSearch,
    rows,
    filtered,
    selected,
    setRowStatus,
    toggleSelect,
    validInFiltered,
    allFilteredSelected,
    toggleAll,
    validSelected,
    isSendingAll,
    handleSendSelected,
    handleSendOne,
    stats,
    setSelected, // in case needed outside
    setRows, // in case needed outside
  };
}
