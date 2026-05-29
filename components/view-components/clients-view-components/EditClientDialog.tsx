"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateClient } from "@/store/slices/clients-slice";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Client } from "@/lib/types";
import { toast } from "sonner";
import DialogInput from "@/components/DialogInput";
import { clientSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";

type EditClientDialogProps = {
  editingClient: Client | null;
  setEditingClient: (client: Client | null) => void;
  saving: boolean;
};

const emptyClientFields: Omit<Client, "id"> = {
  name: "",
  phone: "",
  email: "",
};

export function EditClientDialog({
  editingClient,
  setEditingClient,
  saving,
}: EditClientDialogProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] =
    useState<Omit<Client, "id">>(emptyClientFields);

  // Sync form with editingClient
  useEffect(() => {
    if (editingClient) {
      const { name, phone, email } = editingClient;
      setFormData({ name: name ?? "", phone: phone ?? "", email: email ?? "" });
    } else {
      setFormData(emptyClientFields);
    }
  }, [editingClient]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    const parsed = parseWithSchema(clientSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.message);
      return;
    }
    const result = await dispatch(
      updateClient({ id: editingClient.id, data: parsed.data }),
    );
    if (updateClient.fulfilled.match(result)) {
      toast.success("Клієнта оновлено");
      setEditingClient(null);
    } else {
      toast.error(
        (result.payload as string) || "Помилка під час оновлення клієнта",
      );
    }
  };

  const handleClose = () => setEditingClient(null);

  return (
    <AnimatePresence>
      {editingClient && (
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
              key="client-dialog"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-[400px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <h3 className="text-base font-semibold text-foreground">
                  Редагування клієнта
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
                  id="edit-client-form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <DialogInput
                    name="name"
                    label="Ім’я"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <DialogInput
                    name="phone"
                    label="Телефон"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <DialogInput
                    name="email"
                    label="Email"
                    value={formData.email}
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
                  form="edit-client-form"
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
