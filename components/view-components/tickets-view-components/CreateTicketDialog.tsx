import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Client, SpareParts } from "@/lib/types";
import MultipleSelector from "@/components/ui/multi-select";
import ModalDialogConateiner from "@/components/ModalDialogConateiner";
import DialogInput from "@/components/DialogInput";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useCreateTicketDialogHook } from "@/hooks/useCreateTicketDialogHook";

export function CreateTicketDialog({ clients }: { clients: Client[] }) {
  const {
    formData,
    setFormData,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    needParts,
    setNeedParts,
    serviceOptions,
    selectedServiceOptions,
    handleServicesChange,
    handleInputChange,
    handleSparePartToggle,
    isPartChecked,
    handlePartQuantityChange,
    handleSubmit,
    spareParts,
  } = useCreateTicketDialogHook(clients);

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
                    clientEmail: client?.email ?? "",
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
              value={formData.clientName ?? ""}
              placeholder="Введіть ПІБ клієнта"
              onChange={handleInputChange}
            />
            <DialogInput
              name="clientPhone"
              label="Телефон"
              value={formData.clientPhone ?? ""}
              placeholder="Введіть телефон клієнта"
              onChange={handleInputChange}
            />
            <DialogInput
              name="clientEmail"
              label="Email"
              value={formData.clientEmail ?? ""}
              placeholder="Введіть email клієнта"
              onChange={handleInputChange}
            />
            <DialogInput
              name="device"
              label="Пристрій"
              value={formData.device ?? ""}
              placeholder="Вкажіть пристрій"
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
                  const usedPart = formData?.usedParts?.find(
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
