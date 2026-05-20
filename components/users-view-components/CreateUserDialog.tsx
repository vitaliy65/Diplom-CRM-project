import { useState } from "react";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { type UserProfile as User } from "@/lib/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import ModalDialogConateiner from "../ModalDialogConateiner";
import DialogInput from "../DialogInput";

export function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "master" as User["role"],
    password: "",
  });

  const handleChange =
    (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [key]: e.target.value });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <ModalDialogConateiner
      title="Новий користувач"
      description="Створіть обліковий запис для нового співробітника"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogInput
          name="name"
          label="ПІБ"
          value={formData.name}
          onChange={handleChange("name")}
        />
        <DialogInput
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange("email")}
        />

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm text-foreground">
            Роль
          </label>
          <Select
            value={formData.role}
            onValueChange={(v) =>
              setFormData({ ...formData, role: v as User["role"] })
            }
          >
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue placeholder="Оберіть роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Адміністратор</SelectItem>
              <SelectItem value="manager">Менеджер</SelectItem>
              <SelectItem value="master">Майстер</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogInput
          name="password"
          label="Пароль"
          value={formData.password}
          onChange={handleChange("password")}
        />

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
