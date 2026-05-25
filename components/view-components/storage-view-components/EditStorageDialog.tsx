"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateSparePart } from "@/store/slices/storage-slice";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { SpareParts } from "@/lib/types";
import { toast } from "sonner";
import { sparePartSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";
import DialogInput from "@/components/DialogInput";

type EditStorageDialogProps = {
  editingStorage: SpareParts | null;
  setEditingStorage: (storage: SpareParts | null) => void;
  saving: boolean;
};

const emptySparePartsFields: Omit<SpareParts, "id"> = {
  name: "",
  description: "",
  count: 0,
  priceForOne: 0,
};

export function EditStorageDialog({
  editingStorage,
  setEditingStorage,
  saving,
}: EditStorageDialogProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Omit<SpareParts, "id">>(
    emptySparePartsFields,
  );

  // Sync form with editingStorage
  useEffect(() => {
    if (editingStorage) {
      const { name, description, count, priceForOne } = editingStorage;
      setFormData({
        name: name ?? "",
        description: description ?? "",
        count: count ?? 0,
        priceForOne: priceForOne ?? 0,
      });
    } else {
      setFormData(emptySparePartsFields);
    }
  }, [editingStorage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "count" || name === "priceForOne" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStorage) return;
    const parsed = parseWithSchema(sparePartSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.message);
      return;
    }
    const result = await dispatch(
      updateSparePart({
        id: editingStorage.id,
        data: parsed.data,
      }),
    );
    if (updateSparePart.fulfilled.match(result)) {
      toast.success("Запчастину оновлено");
      setEditingStorage(null);
    } else {
      toast.error(
        (result.payload as string) || "Помилка під час оновлення запчастини",
      );
    }
  };

  const handleClose = () => setEditingStorage(null);

  return (
    <AnimatePresence>
      {editingStorage && (
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
              key="storage-dialog"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-[400px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <h3 className="text-base font-semibold text-foreground">
                  Редагування запчастини
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
                  id="edit-storage-form"
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
                    name="description"
                    label="Опис"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  <DialogInput
                    name="count"
                    label="Кількість"
                    value={formData.count}
                    onChange={handleChange}
                  />
                  <DialogInput
                    name="priceForOne"
                    label="Ціна за одиницю"
                    value={formData.priceForOne}
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
                  form="edit-storage-form"
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
