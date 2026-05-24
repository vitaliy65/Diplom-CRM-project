import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import ModalDialogConateiner from "@/components/ModalDialogConateiner";
import { SpareParts } from "@/lib/types";
import DialogInput from "@/components/DialogInput";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { createSparePart } from "@/store/slices/storage-slice";
import { toast } from "sonner";

export function CreateStorageDialog() {
  const [formData, setFormData] = useState<Omit<SpareParts, "id">>({
    name: "",
    description: "",
    count: 0,
    priceForOne: 0,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const dispatch = useAppDispatch();

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
    const result = await dispatch(createSparePart(formData));
    if (createSparePart.fulfilled.match(result)) {
      toast.success("Запчастину додано");
      setIsCreateDialogOpen(false);
    } else {
      toast.error(
        (result.payload as string) || "Помилка під час додавання запчастини",
      );
    }
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" />
            Додати запчастину
          </Button>
        </motion.div>
      </DialogTrigger>
      {isCreateDialogOpen && (
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Скасувати
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Створити
              </Button>
            </DialogFooter>
          </form>
        </ModalDialogConateiner>
      )}
    </Dialog>
  );
}

export default CreateStorageDialog;
