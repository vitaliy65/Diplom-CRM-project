"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WrenchIcon, PackageIcon, X } from "lucide-react";
import { ServicesSelectorPanel } from "./ServicesSelectorPanel";
import { SparePartsSelectorPanel } from "./SparePartsSelectorPanel";
import { getStatusOptionsForSelect } from "@/lib/ticket-status";
import { computeSlaViolation } from "@/lib/sla";
import { statusLabels } from "@/lib/types";
import { useEditTicketDialog } from "@/hooks/use-edit-ticket";

type EditTicketDialogProps = {
  editingTicket: any;
  setEditingTicket: (ticket: any) => void;
  saving: boolean;
};

export function EditTicketDialog({
  editingTicket,
  setEditingTicket,
  saving,
}: EditTicketDialogProps) {
  const {
    formData,
    showServices,
    showParts,
    masters,
    currentUser,
    isMobile,
    handleChange,
    handleToggleService,
    handleTogglePart,
    handlePartQuantityChange,
    handleSubmit,
    handleClose,
    setShowServices,
    setShowParts,
  } = useEditTicketDialog({
    editingTicket,
    setEditingTicket,
    saving,
  });

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
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${isMobile ? "" : ""}`}
          >
            <div
              className={`flex items-stretch gap-2 pointer-events-auto max-h-[90vh] ${isMobile ? "w-full" : ""}`}
            >
              {/* ── Main dialog ─────────────────────────────────────────── */}
              <motion.div
                key="dialog"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2 }}
                className={`relative z-10 w-[480px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden 
                  ${isMobile && "w-full rounded-none!"} ${(showServices || showParts) && isMobile && "hidden"}`}
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
                        ).map((s: string) => (
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
                        {masters.map((master: any) => (
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
                        onClick={() =>
                          setShowServices((prev: boolean) => !prev)
                        }
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
                        onClick={() => setShowParts((prev: boolean) => !prev)}
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
                  onClose={() => setShowServices((prev: boolean) => !prev)}
                />
              )}

              {/* ── Spare parts panel ────────────────────────────────────── */}
              {showParts && (
                <SparePartsSelectorPanel
                  selectedParts={formData.usedParts}
                  onToggle={handleTogglePart}
                  onQuantityChange={handlePartQuantityChange}
                  onClose={() => setShowParts((prev: boolean) => !prev)}
                />
              )}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
