import { Button } from "../ui/button";
import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export function CreateTicketDialog({
    onClose,
    onSubmit,
    clients,
  }: {
    onClose: () => void
    onSubmit: (payload: {
      clientId: string
      clientName: string
      clientPhone: string
      device: string
      problem: string
    }) => Promise<void>
    clients: { id: string; name: string; phone: string }[]
  }) {
    const [formData, setFormData] = useState({
      clientId: "",
      clientName: "",
      clientPhone: "",
      device: "",
      problem: "",
    })
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      await onSubmit(formData)
    }
  
    return (
      <DialogContent className=" border-border/50 w-[calc(100%-2rem)] sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Нова заявка</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Заповніть дані для створення заявки
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Клієнт</Label>
            <Select
              value={formData.clientId}
              onValueChange={(clientId) => {
                const client = clients.find((item) => item.id === clientId)
                setFormData((prev) => ({
                  ...prev,
                  clientId,
                  clientName: client?.name || "",
                  clientPhone: client?.phone || "",
                }))
              }}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50 focus:border-primary/50">
                <SelectValue placeholder="Оберіть клієнта" />
              </SelectTrigger>
              <SelectContent className="">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-sm text-foreground">
              ПІБ клієнта
            </Label>
            <Input
              id="clientName"
              placeholder="Іванов Іван Іванович"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone" className="text-sm text-foreground">
              Телефон
            </Label>
            <Input
              id="clientPhone"
              placeholder="+380 XX XXX XXXX"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              className="bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device" className="text-sm text-foreground">
              Пристрій
            </Label>
            <Input
              id="device"
              placeholder="iPhone 14, Samsung Galaxy S23..."
              value={formData.device}
              onChange={(e) => setFormData({ ...formData, device: e.target.value })}
              className="bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="problem" className="text-sm text-foreground">
              Опис проблеми
            </Label>
            <Textarea
              id="problem"
              placeholder="Опишіть проблему детально..."
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              className="min-h-24 bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
              Скасувати
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              Створити
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    )
  }             