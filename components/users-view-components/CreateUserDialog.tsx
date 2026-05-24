import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogFooter, DialogTrigger } from "../ui/dialog";
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
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function CreateUserDialog() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "master" as User["role"],
    password: "",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleChange =
    (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [key]: e.target.value });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateDialogOpen(false);
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" />
            Новий користувач
          </Button>
        </motion.div>
      </DialogTrigger>
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
    </Dialog>
  );
}
