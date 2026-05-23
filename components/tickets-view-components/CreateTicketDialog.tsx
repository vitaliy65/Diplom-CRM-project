import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogFooter, DialogTrigger } from "../ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import * as React from "react";
import { SpareParts, UsedPartsTicket } from "@/lib/types";
import MultipleSelector from "../ui/multi-select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ModalDialogConateiner from "../ModalDialogConateiner";
import DialogInput from "../DialogInput";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { CheckTicketFields } from "@/error-handlers/ticketErrorHandler";
import { createTicket } from "@/store/slices/tickets-slice";
import { toast } from "sonner";

export function CreateTicketDialog({
  clients,
}: {
  clients: { id: string; name: string; phone: string }[];
}) {
  const services = useAppSelector((s) => s.services.items);
  // Use storage.items (see storage-slice and store/index)
  const spareParts = useAppSelector((s) => s.storage.items);

  // UsedParts = UserParts[], i.e., id + quantity
  const [formData, setFormData] = useState<{
    clientId: string;
    clientName: string;
    clientPhone: string;
    device: string;
    problem: string;
    services: string[];
    usedParts: UsedPartsTicket[];
  }>({
    clientId: "",
    clientName: "",
    clientPhone: "",
    device: "",
    problem: "",
    services: [],
    usedParts: [],
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const dispatch = useAppDispatch();
  const [needParts, setNeedParts] = useState(false);

  const serviceOptions = Array.from(services).map((service) => ({
    value: service.id,
    label: service.name,
  }));

  const selectedServiceOptions = serviceOptions.filter((opt) =>
    formData.services.includes(opt.value),
  );

  const handleServicesChange = (
    selected: { value: string; label: string }[],
  ) => {
    const selectedServiceIds = selected.map((opt) => opt.value);
    setFormData((prev) => ({
      ...prev,
      services: selectedServiceIds,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Add/remove a spare part from the usedParts array
  const handleSparePartToggle = (part: SpareParts, checked: boolean) => {
    setFormData((prev) => {
      const index = prev.usedParts.findIndex((p) => p.id === part.id);
      if (checked && index === -1) {
        // Add new part with quantity "1" and correct name
        return {
          ...prev,
          usedParts: [
            ...prev.usedParts,
            { id: part.id, name: part.name, quantity: "1" },
          ],
        };
      } else if (!checked && index !== -1) {
        // Remove this part
        return {
          ...prev,
          usedParts: prev.usedParts.filter((p) => p.id !== part.id),
        };
      } else {
        return prev;
      }
    });
  };

  // To determine if part is checked, look for it in usedParts
  const isPartChecked = (part: SpareParts) => {
    return formData.usedParts.some((p) => p.id === part.id);
  };

  // Update the quantity for a used part
  const handlePartQuantityChange = (partId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      usedParts: prev.usedParts.map((part) =>
        part.id === partId ? { ...part, quantity: value } : part,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields = CheckTicketFields(formData);

    if (missingFields.length > 0) {
      toast.error(`Будь ласка, заповніть усі обов'язкові поля!`);
      return;
    }

    const result = await dispatch(createTicket(formData));
    if (createTicket.fulfilled.match(result)) {
      toast.success("Заявку збережено");
      setIsCreateDialogOpen(false);
    } else {
      toast.error((result.payload as string) || "Помилка збереження заявки");
    }
  };

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto cursor-pointer">
            <Plus className="h-4 w-4" />
            Нова заявка
          </Button>
        </motion.div>
      </DialogTrigger>
      <ModalDialogConateiner
        title="Нова заявка"
        description="Заповніть дані для створення заявки"
        className="max-w-2/3! w-fit"
      >
        <div className="flex md:flex-row flex-col gap-4">
          <form onSubmit={handleSubmit} className="w-md space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-foreground">Клієнт</label>
              <Select
                value={formData.clientId}
                onValueChange={(clientId) => {
                  const client = clients.find((item) => item.id === clientId);
                  setFormData((prev) => ({
                    ...prev,
                    clientId,
                    clientName: client?.name ?? "",
                    clientPhone: client?.phone ?? "",
                  }));
                }}
              >
                <SelectTrigger className="bg-secondary/50 border-border/50 focus:border-primary/50">
                  <SelectValue placeholder="Оберіть клієнта" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogInput
              name="clientName"
              label="ПІБ клієнта"
              value={formData.clientName}
              onChange={handleInputChange}
            />
            <DialogInput
              name="clientPhone"
              label="Телефон"
              value={formData.clientPhone}
              onChange={handleInputChange}
            />
            <DialogInput
              name="device"
              label="Пристрій"
              value={formData.device}
              onChange={handleInputChange}
            />

            <div className="space-y-2">
              <label htmlFor="services" className="text-sm text-foreground">
                Сервіси
              </label>
              <MultipleSelector
                placeholder="Оберіть сервіс..."
                options={serviceOptions}
                value={selectedServiceOptions}
                onChange={handleServicesChange}
              />
            </div>
            <div className="flex items-center space-y-2 gap-4">
              <label htmlFor="services" className="text-sm text-foreground m-0">
                Потрібні запчастини?
              </label>
              <Checkbox
                id="needParts"
                checked={needParts}
                onCheckedChange={(checked) => {
                  setNeedParts(!!checked);
                }}
                className={cn("m-0", !needParts && "bg-red-400!")}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="problem" className="text-sm text-foreground">
                Опис проблеми
              </label>
              <Textarea
                id="problem"
                placeholder="Опишіть проблему детально..."
                value={formData.problem}
                onChange={handleInputChange}
                className="min-h-24 bg-secondary/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              >
                Створити
              </Button>
            </DialogFooter>
          </form>
          {needParts && (
            <div
              className="w-full md:w-[260px] h-full bg-background border border-border/50 rounded-md px-4 py-3 flex flex-col gap-2 overflow-y-auto"
              style={{ maxHeight: "400px" }}
            >
              <div className="font-semibold text-base mb-2">
                Оберіть запчастини:
              </div>
              {spareParts && spareParts.length > 0 ? (
                spareParts.map((part: SpareParts) => {
                  const checked = isPartChecked(part);
                  const usedPart = formData.usedParts.find(
                    (p) => p.id === part.id,
                  );
                  return (
                    <div
                      key={part.id}
                      className="flex items-center gap-2 cursor-pointer py-1"
                    >
                      <Checkbox
                        id={`sparepart-${part.id}`}
                        checked={checked}
                        onCheckedChange={(checked) => {
                          handleSparePartToggle(part, !!checked);
                        }}
                      />
                      <span className="flex-1">{part.name}</span>
                      {checked && (
                        <input
                          type="number"
                          min={1}
                          max={part.count}
                          step={1}
                          className="w-14 text-xs border rounded px-1 py-0.5 bg-secondary/50 border-border/50 focus:border-primary/50"
                          value={usedPart?.quantity ?? 1}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            // Do not allow empty, zero, or negative or above max
                            let numericValue = parseInt(value, 10);
                            if (isNaN(numericValue) || numericValue < 1) {
                              value = "1";
                            } else if (numericValue > part.count) {
                              value = part.count.toString();
                            } else {
                              value = numericValue.toString();
                            }
                            handlePartQuantityChange(part.id, value);
                          }}
                          title="Кількість"
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-muted-foreground text-sm">
                  Немає доступних запчастин
                </div>
              )}
            </div>
          )}
        </div>
      </ModalDialogConateiner>
    </Dialog>
  );
}
