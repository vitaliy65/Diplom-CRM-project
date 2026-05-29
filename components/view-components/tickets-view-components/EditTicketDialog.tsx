"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { updateTicket } from "@/store/slices/tickets-slice";
import { editTicketPanelSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";
import { enrichUsedParts } from "@/lib/storage-stock";
import { selectStorage } from "@/store/slices/storage-slice";
import { getStatusOptionsForSelect } from "@/lib/ticket-status";
import { computeSlaViolation } from "@/lib/sla";
import { selectCurrentUser } from "@/store/slices/auth-slice";
import { statusLabels } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Ticket } from "@/lib/types";
import { selectMasters } from "@/store/slices/users-slice";
import { WrenchIcon, PackageIcon, X } from "lucide-react";
import { ServicesSelectorPanel } from "./ServicesSelectorPanel";
import { SparePartsSelectorPanel } from "./SparePartsSelectorPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type EditTicketDialogProps = {
  editingTicket: Ticket | null;
  setEditingTicket: (ticket: Ticket | null) => void;
  saving: boolean;
};

const emptyTicketFields: Omit<Ticket, "id" | "isEmailDelivered"> = {
  clientId: "",
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  device: "",
  problem: "",
  status: "received",
  masterId: "",
  masterName: "",
  createdAt: "",
  readyAt: "",
  slaViolation: false,
  comments: [],
  services: [],
  usedParts: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EditTicketDialog({
  editingTicket,
  setEditingTicket,
  saving,
}: EditTicketDialogProps) {
  const dispatch = useAppDispatch();
  const masters = useAppSelector(selectMasters);
  const currentUser = useAppSelector(selectCurrentUser);
  const storage = useAppSelector(selectStorage);

  const [formData, setFormData] =
    useState<Omit<Ticket, "id" | "isEmailDelivered">>(emptyTicketFields);
  const [showServices, setShowServices] = useState(false);
  const [showParts, setShowParts] = useState(false);

  // ── Sync form when ticket changes ──────────────────────────────────────

  useEffect(() => {
    if (editingTicket) {
      const { id, ...rest } = editingTicket;
      setFormData({ ...emptyTicketFields, ...rest });
      // Auto-open panels if ticket already has selections
      setShowServices((rest.services?.length ?? 0) > 0);
      setShowParts((rest.usedParts?.length ?? 0) > 0);
    } else {
      setFormData(emptyTicketFields);
      setShowServices(false);
      setShowParts(false);
    }
  }, [editingTicket]);

  // ── Generic field change ───────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === "masterId") {
      const selectedMaster = masters.find((m) => m.id === value);
      setFormData((prev) => ({
        ...prev,
        masterId: value,
        masterName: selectedMaster ? selectedMaster.name : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Services handlers ──────────────────────────────────────────────────

  const handleToggleService = useCallback((id: string) => {
    setFormData((prev) => {
      const already = prev.services.includes(id);
      return {
        ...prev,
        services: already
          ? prev.services.filter((s) => s !== id)
          : [...prev.services, id],
      };
    });
  }, []);

  // ── Spare parts handlers ───────────────────────────────────────────────

  const handleTogglePart = useCallback((id: string, name: string) => {
    setFormData((prev) => {
      const exists = prev.usedParts.find((p) => p.id === id);
      return {
        ...prev,
        usedParts: exists
          ? prev.usedParts.filter((p) => p.id !== id)
          : [...prev.usedParts, { id, name, quantity: 1 }],
      };
    });
  }, []);

  const handlePartQuantityChange = useCallback(
    (id: string, quantity: number) => {
      setFormData((prev) => ({
        ...prev,
        usedParts: prev.usedParts.map((p) =>
          p.id === id ? { ...p, quantity } : p,
        ),
      }));
    },
    [],
  );

  // ── Panel toggle helpers (also clear selections on close) ──────────────

  const toggleServices = () => {
    setShowServices((prev) => {
      if (prev) {
        // closing — clear selections
        setFormData((f) => ({ ...f, services: [] }));
      }
      return !prev;
    });
  };

  const toggleParts = () => {
    setShowParts((prev) => {
      if (prev) {
        setFormData((f) => ({ ...f, usedParts: [] }));
      }
      return !prev;
    });
  };

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    const panelPayload = {
      status: formData.status,
      masterId: formData.masterId || null,
      masterName: formData.masterName,
      services: formData.services,
      usedParts: enrichUsedParts(formData.usedParts, storage),
    };

    const parsed = parseWithSchema(editTicketPanelSchema, panelPayload);
    if (!parsed.success) {
      toast.error(parsed.message);
      return;
    }

    const result = await dispatch(
      updateTicket({ id: editingTicket.id, data: parsed.data }),
    );
    if (updateTicket.fulfilled.match(result)) {
      toast.success("Тікет оновлено");
      setEditingTicket(null);
    } else {
      toast.error(
        (result.payload as string) || "Помилка під час оновлення тікету",
      );
    }
  };

  const handleClose = () => setEditingTicket(null);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {editingTicket && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog row — main form + slide-out panels */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="flex items-stretch gap-2 pointer-events-auto max-h-[90vh]">
              {/* ── Main dialog ─────────────────────────────────────────── */}
              <motion.div
                key="dialog"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-[480px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                  <h3 className="text-base font-semibold text-foreground">
                    Редагування тікету
                  </h3>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Scrollable form body */}
                <div className="overflow-y-auto flex-1 px-6 py-4">
                  <form
                    id="edit-ticket-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Status */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="status"
                        className="text-sm font-medium text-foreground"
                      >
                        Статус
                      </label>
                      <select
                        id="status"
                        name="status"
                        className="w-full rounded-md px-3 py-2 text-sm border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        {getStatusOptionsForSelect(
                          editingTicket.status,
                          currentUser?.role,
                        ).map((s) => (
                          <option key={s} value={s}>
                            {statusLabels[s]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Master */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="masterId"
                        className="text-sm font-medium text-foreground"
                      >
                        Майстер
                      </label>
                      <select
                        id="masterId"
                        name="masterId"
                        className="w-full rounded-md px-3 py-2 text-sm border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        value={formData.masterId || ""}
                        onChange={handleChange}
                      >
                        <option value="">Оберіть майстра</option>
                        {masters.map((master) => (
                          <option key={master.id} value={master.id}>
                            {master.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SLA (обчислюється автоматично) */}
                    <div className="rounded-md border border-border px-3 py-2 text-sm">
                      <span className="text-muted-foreground">SLA: </span>
                      <span
                        className={
                          computeSlaViolation({
                            ...editingTicket,
                            ...formData,
                          })
                            ? "text-red-500 font-medium"
                            : "text-emerald-600 font-medium"
                        }
                      >
                        {computeSlaViolation({
                          ...editingTicket,
                          ...formData,
                        })
                          ? "Порушено"
                          : "В нормі"}
                      </span>
                    </div>

                    {/* ── Panel toggles ──────────────────────────────── */}
                    <div className="pt-1 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Додати до тікету
                      </p>

                      {/* Services toggle */}
                      <button
                        type="button"
                        onClick={toggleServices}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          showServices
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/60 text-foreground"
                        }`}
                      >
                        <WrenchIcon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">Послуги</span>
                        {formData.services.length > 0 && (
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                            {formData.services.length}
                          </span>
                        )}
                        <span
                          className={`text-xs transition-colors ${showServices ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {showServices ? "Приховати" : "Показати"}
                        </span>
                      </button>

                      {/* Spare parts toggle */}
                      <button
                        type="button"
                        onClick={toggleParts}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          showParts
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/60 text-foreground"
                        }`}
                      >
                        <PackageIcon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">Запчастини</span>
                        {formData.usedParts.length > 0 && (
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                            {formData.usedParts.length}
                          </span>
                        )}
                        <span
                          className={`text-xs transition-colors ${showParts ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {showParts ? "Приховати" : "Показати"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
                  <Button type="button" variant="ghost" onClick={handleClose}>
                    Скасувати
                  </Button>
                  <Button
                    type="submit"
                    form="edit-ticket-form"
                    className="bg-primary hover:bg-primary/90"
                    disabled={saving}
                  >
                    {saving ? "Збереження…" : "Зберегти"}
                  </Button>
                </div>
              </motion.div>

              {/* ── Services panel ───────────────────────────────────────── */}
              {showServices && (
                <ServicesSelectorPanel
                  selectedIds={formData.services}
                  onToggle={handleToggleService}
                />
              )}

              {/* ── Spare parts panel ────────────────────────────────────── */}
              {showParts && (
                <SparePartsSelectorPanel
                  selectedParts={formData.usedParts}
                  onToggle={handleTogglePart}
                  onQuantityChange={handlePartQuantityChange}
                />
              )}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
