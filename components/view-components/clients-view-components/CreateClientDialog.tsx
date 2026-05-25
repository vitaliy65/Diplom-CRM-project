import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ModalDialogConateiner from "@/components/ModalDialogConateiner";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { createClient } from "@/store/slices/clients-slice";
import { toast } from "sonner";
import { clientSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";

export function CreateClientDialog() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseWithSchema(clientSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.message);
      return;
    }
    const result = await dispatch(createClient(parsed.data));
    if (createClient.fulfilled.match(result)) {
      toast.success("Клієнта додано");
      setIsCreateDialogOpen(false);
    } else {
      toast.error((result.payload as string) || "Помилка додавання клієнта");
    }
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto cursor-pointer">
            <Plus className="h-4 w-4" />
            Новий клієнт
          </Button>
        </motion.div>
      </DialogTrigger>
      <ModalDialogConateiner
        title="Новий клієнт"
        description="Додайте нового клієнта до бази даних"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-foreground">
              ПІБ
            </Label>
            <Input
              id="name"
              placeholder="Іванов Іван Іванович"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm text-foreground">
              Телефон
            </Label>
            <Input
              id="phone"
              placeholder="+380 XX XXX XXXX"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-secondary/50 border-border/50 focus:border-primary/50"
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
              Додати
            </Button>
          </DialogFooter>
        </form>
      </ModalDialogConateiner>
    </Dialog>
  );
}
