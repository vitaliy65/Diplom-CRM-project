import { useState } from "react";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import ModalDialogConateiner from "../ModalDialogConateiner";

export function CreateClientDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    phone: string;
    email: string;
  }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <Button type="button" variant="ghost" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Додати
          </Button>
        </DialogFooter>
      </form>
    </ModalDialogConateiner>
  );
}
