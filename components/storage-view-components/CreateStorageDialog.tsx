import { useState } from "react";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import ModalDialogConateiner from "../ModalDialogConateiner";
import { SpareParts } from "@/lib/types";
import DialogInput from "../DialogInput";

export function CreateStorageDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: Omit<SpareParts, "id">) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Omit<SpareParts, "id">>({
    name: "",
    description: "",
    count: 0,
    priceForOne: 0,
  });

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
    await onSubmit(formData);
  };

  return (
    <ModalDialogConateiner
      title="Нова запчастина"
      description="Додайте нову запчастину на склад"
    >
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
          <label htmlFor="priceForOne" className="text-sm text-foreground">
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
          <Button type="button" variant="ghost" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Створити
          </Button>
        </DialogFooter>
      </form>
    </ModalDialogConateiner>
  );
}

export default CreateStorageDialog;
