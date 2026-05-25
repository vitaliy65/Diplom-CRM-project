"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateService } from "@/store/slices/services-slice";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Service } from "@/lib/types";
import { toast } from "sonner";
import { serviceSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";
import DialogInput from "@/components/DialogInput";

type EditServiceDialogProps = {
  editingService: Service | null;
  setEditingService: (service: Service | null) => void;
  saving: boolean;
};

const emptyServiceFields: Omit<Service, "id"> = {
  name: "",
  base_price: 0,
  final_price: 0,
  discount: 0,
};

export function EditServiceDialog({
  editingService,
  setEditingService,
  saving,
}: EditServiceDialogProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] =
    useState<Omit<Service, "id">>(emptyServiceFields);

  // Sync form with editingService
  useEffect(() => {
    if (editingService) {
      const { name, base_price, final_price, discount } = editingService;
      setFormData({
        name: name ?? "",
        base_price: base_price ?? 0,
        final_price: final_price ?? 0,
        discount: discount ?? 0,
      });
    } else {
      setFormData(emptyServiceFields);
    }
  }, [editingService]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Math.max(0, Number(value)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    const payload = {
      ...formData,
      discount: Math.max(
        0,
        Math.round(
          ((formData.base_price - formData.final_price) /
            (formData.base_price || 1)) *
            100,
        ),
      ),
    };
    const parsed = parseWithSchema(serviceSchema, payload);
    if (!parsed.success) {
      toast.error(parsed.message);
      return;
    }
    const result = await dispatch(
      updateService({
        id: editingService.id,
        data: parsed.data,
      }),
    );
    if (updateService.fulfilled.match(result)) {
      toast.success("Сервіс оновлено");
      setEditingService(null);
    } else {
      toast.error(
        (result.payload as string) || "Помилка під час оновлення сервісу",
      );
    }
  };

  const handleClose = () => setEditingService(null);

  return (
    <AnimatePresence>
      {editingService && (
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

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div
              key="service-dialog"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-[400px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <h3 className="text-base font-semibold text-foreground">
                  Редагування сервісу
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Form Body */}
              <div className="overflow-y-auto flex-1 px-6 py-4">
                <form
                  id="edit-service-form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <DialogInput
                    name="name"
                    label="Назва"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <DialogInput
                    name="base_price"
                    label="Базова вартість"
                    value={formData.base_price}
                    onChange={handleChange}
                  />
                  <DialogInput
                    name="final_price"
                    label="Фінальна вартість"
                    value={formData.final_price}
                    onChange={handleChange}
                  />
                </form>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  form="edit-service-form"
                  className="bg-primary hover:bg-primary/90"
                  disabled={saving}
                >
                  {saving ? "Збереження…" : "Зберегти"}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
