import { useState } from "react";
import { Button } from "../ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { type UserProfile as User } from "@/lib/types";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

export function CreateUserDialog({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      role: "master" as User["role"],
      password: "",
    })
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onClose()
    }
  
    return (
      <DialogContent className=" border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Новий користувач</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Створіть обліковий запис для нового співробітника
          </DialogDescription>
        </DialogHeader>
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
            <Label htmlFor="email" className="text-sm text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@service.ua"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm text-foreground">
              Роль
            </Label>
            <Select
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v as User["role"] })}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Оберіть роль" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem value="admin">Адміністратор</SelectItem>
                <SelectItem value="manager">Менеджер</SelectItem>
                <SelectItem value="master">Майстер</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-foreground">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-secondary/50 border-border/50 focus:border-primary/50"
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
      </DialogContent>
    )
  }