import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import DialogInput from "@/components/DialogInput";
import type { Service } from "@/lib/types";
import { Dialog, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import ModalDialogConateiner from "../ModalDialogConateiner";
import { useAppDispatch } from "@/store/hooks";
import { createService } from "@/store/slices/services-slice";
import { toast } from "sonner";
type ServiceFormInitial = Omit<Service, "id">;

type ServiceFormProps = {
  initial?: ServiceFormInitial;
  saving?: boolean;
};

export function CreateServiceDialog({ initial, saving }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormInitial>({
    name: initial?.name ?? "",
    base_price: initial?.base_price ?? 0,
    final_price: initial?.final_price ?? 0,
    discount: initial?.discount ?? 0,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const dispatch = useAppDispatch();

  // DialogInput expects (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
  const handleInputChange = (
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

    const payload = {
      name: formData.name,
      base_price: Number(formData.base_price),
      final_price: Number(formData.final_price),
      discount: Number(formData.discount),
    };
    const result = await dispatch(createService(payload));
    if (createService.fulfilled.match(result)) {
      toast.success("Сервіс додано");
      setIsCreateDialogOpen(false);
    } else {
      toast.error(
        (result.payload as string) || "Помилка під час додавання сервісу",
      );
    }
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" />
            Додати сервіс
          </Button>
        </motion.div>
      </DialogTrigger>
      {isCreateDialogOpen && (
        <ModalDialogConateiner
          title="Новий сервіс"
          description="Додайте новий сервіс до бази даних"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <DialogInput
              name="name"
              label="Назва"
              value={formData.name}
              onChange={handleInputChange}
            />
            <DialogInput
              name="base_price"
              label="Базова вартість (₴)"
              value={formData.base_price}
              onChange={handleInputChange}
            />
            <DialogInput
              name="final_price"
              label="Фінальна вартість (₴)"
              value={formData.final_price}
              onChange={handleInputChange}
            />
            <Button className="w-full mt-2" type="submit" disabled={saving}>
              {saving ? "Збереження..." : "Зберегти"}
            </Button>
          </form>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Скасувати
            </Button>
          </DialogFooter>
        </ModalDialogConateiner>
      )}
    </Dialog>
  );
}
