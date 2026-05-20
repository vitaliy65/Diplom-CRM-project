import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { AnimatePresence } from "framer-motion";
import DialogInput from "../DialogInput";
import { updateSparePart } from "@/store/slices/storage-slice";
import { Button } from "../ui/button";
import { toast } from "sonner";
import type { SpareParts } from "@/lib/types";

type EditStorageDialogProps = {
  editingStorage: SpareParts | null;
  setEditingStorage: (storage: SpareParts | null) => void;
  saving: boolean;
};

export function EditStorageDialog({
  editingStorage,
  setEditingStorage,
  saving,
}: EditStorageDialogProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Omit<SpareParts, "id">>({
    name: "",
    description: "",
    count: 0,
    priceForOne: 0,
  });

  useEffect(() => {
    if (editingStorage) {
      setFormData({
        name: editingStorage.name,
        description: editingStorage.description,
        count: editingStorage.count,
        priceForOne: editingStorage.priceForOne,
      });
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
    const result = await dispatch(
      updateSparePart({
        id: editingStorage.id,
        data: formData,
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

  return (
    <Dialog
      open={!!editingStorage}
      onOpenChange={(open) => !open && setEditingStorage(null)}
    >
      <AnimatePresence>
        {editingStorage && (
          <DialogContent className="flex items-center justify-center">
            <div className="w-full">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Редагування запчастини
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogInput
                  label="Назва"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <DialogInput
                  label="Опис"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
                <div className="space-y-2 space-x-4">
                  <label htmlFor="count" className="text-sm text-foreground">
                    Кількість
                  </label>
                  <input
                    id="count"
                    name="count"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.count}
                    onChange={handleChange}
                    className="bg-secondary/50 border-border/50 focus:border-primary/50"
                    required
                  />
                </div>
                <div className="space-y-2 space-x-4">
                  <label
                    htmlFor="priceForOne"
                    className="text-sm text-foreground"
                  >
                    Ціна за одиницю
                  </label>
                  <input
                    id="priceForOne"
                    name="priceForOne"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={formData.priceForOne}
                    onChange={handleChange}
                    className="bg-secondary/50 border-border/50 focus:border-primary/50"
                    required
                  />
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingStorage(null)}
                  >
                    Скасувати
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={saving}
                  >
                    Зберегти
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
