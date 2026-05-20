import { Button } from "../ui/button";
import { useState } from "react";
import { DialogFooter } from "../ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import * as React from "react";
import { Service, SpareParts, UsedPartsTicket } from "@/lib/types";
import MultipleSelector from "../ui/multi-select";
import { useAppSelector } from "@/store/hooks";
import ModalDialogConateiner from "../ModalDialogConateiner";
import DialogInput from "../DialogInput";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";

export function CreateTicketDialog({
  onClose,
  onSubmit,
  clients,
}: {
  onClose: () => void;
  onSubmit: (payload: {
    clientId: string;
    clientName: string;
    clientPhone: string;
    device: string;
    problem: string;
    services: Service[];
    usedParts: UsedPartsTicket[];
  }) => Promise<void>;
  clients: { id: string; name: string; phone: string }[];
}) {
  const services = useAppSelector((s) => s.services.items);
  // Use storage.items (see storage-slice and store/index)
  const spareParts = useAppSelector((s) => s.storage.items);

  const [formData, setFormData] = useState<{
    clientId: string;
    clientName: string;
    clientPhone: string;
    device: string;
    problem: string;
    services: Service[];
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

  const [needParts, setNeedParts] = useState(false);

  const serviceOptions = Array.from(services).map((service) => ({
    value: service.id,
    label: service.name,
  }));

  const selectedServiceOptions = formData.services.map((service) => ({
    value: service.id,
    label: service.name,
  }));

  const handleServicesChange = (
    selected: { value: string; label: string }[],
  ) => {
    const selectedServiceIds = selected.map((opt) => opt.value);
    const selectedServices: Service[] = services.filter((s) =>
      selectedServiceIds.includes(s.id),
    );
    setFormData((prev) => ({
      ...prev,
      services: selectedServices,
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

  // Add/remove a spare part from the usedParts field
  const handleSparePartToggle = (part: SpareParts, checked: boolean) => {
    setFormData((prev) => {
      const alreadyIncluded = prev.usedParts.some((p) => p.id === part.id);
      if (checked && !alreadyIncluded) {
        return {
          ...prev,
          usedParts: [
            ...prev.usedParts,
            {
              id: part.id,
              name: part.name,
              quantity: "1",
            },
          ],
        };
      } else if (!checked && alreadyIncluded) {
        return {
          ...prev,
          usedParts: prev.usedParts.filter((p) => p.id !== part.id),
        };
      } else {
        return prev;
      }
    });
  };

  // Track selected part checkboxes (to handle correct controlled state)
  const isPartChecked = (part: SpareParts) => {
    return formData.usedParts.some((p) => p.id === part.id);
  };

  // Handle quantity change for a used part
  const handlePartQuantityChange = (partId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      usedParts: prev.usedParts.map((p) =>
        p.id === partId ? { ...p, quantity: value } : p,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
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
              onClick={onClose}
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
                        step={1}
                        className="w-14 text-xs border rounded px-1 py-0.5 bg-secondary/50 border-border/50 focus:border-primary/50"
                        value={usedPart?.quantity ?? "1"}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          // Do not allow empty, zero, or negative
                          if (value === "" || parseInt(value) < 1) value = "1";
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
  );
}
