import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Client } from "@/lib/types";
import MultipleSelector from "@/components/ui/multi-select";
import DialogInput from "@/components/DialogInput";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useCreateTicketDialogHook } from "@/hooks/useCreateTicketDialogHook";
import { SparePartsSelectorPanel } from "@/components/view-components/tickets-view-components/SparePartsSelectorPanel";

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
    handlePartQuantityChange,
    handleSubmit,
    spareParts,
  } = useCreateTicketDialogHook(clients);

  // Helper to close dialog
  const handleClose = () => setIsCreateDialogOpen(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-block"
      >
        <Button
          className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto cursor-pointer"
          onClick={() => setIsCreateDialogOpen(true)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Нова заявка
        </Button>
      </motion.div>

      <AnimatePresence>
        {isCreateDialogOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Dialog row */}
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none`}
            >
              <div
                className={`flex items-stretch gap-2 pointer-events-auto h-screen w-full md:max-h-[90vh]`}
              >
                {/* Spare parts panel */}
                {!needParts ? (
                  <motion.div
                    key="dialog"
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className={`relative z-10 w-full md:w-[480px] bg-background border border-border md:rounded-xl shadow-2xl flex flex-col overflow-hidden`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                      <h3 className="text-base font-semibold text-foreground">
                        Нова заявка
                      </h3>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Plus
                          className="h-4 w-4"
                          style={{ transform: "rotate(45deg)" }}
                        />
                      </button>
                    </div>

                    {/* Scrollable form body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Клієнт */}
                        <div className="space-y-2">
                          <label className="text-sm text-foreground">
                            Клієнт
                          </label>
                          <Select
                            value={formData.clientId}
                            onValueChange={(clientId) => {
                              const client = clients.find(
                                (item) => item.id === clientId,
                              );
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

                        {/* Сервіси */}
                        <div className="space-y-2">
                          <label
                            htmlFor="services"
                            className="text-sm text-foreground"
                          >
                            Сервіси
                          </label>
                          <MultipleSelector
                            placeholder="Оберіть сервіс..."
                            options={serviceOptions}
                            value={selectedServiceOptions}
                            onChange={handleServicesChange}
                          />
                        </div>

                        {/* Потрібні запчастини */}
                        <div className="flex items-center space-y-2 gap-4">
                          <label
                            htmlFor="services"
                            className="text-sm text-foreground m-0"
                          >
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

                        {/* Опис проблеми */}
                        <div className="space-y-2">
                          <label
                            htmlFor="problem"
                            className="text-sm text-foreground"
                          >
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
                        {/* Footer */}
                        <div className="flex flex-col md:flex-row items-center justify-end gap-2 pt-2">
                          <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                          >
                            Створити
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="w-full sm:w-auto"
                          >
                            Скасувати
                          </Button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                ) : (
                  <SparePartsSelectorPanel
                    selectedParts={formData.usedParts || []}
                    onToggle={(id, name) => {
                      const part = spareParts.find((p) => p.id === id);
                      if (part)
                        handleSparePartToggle(
                          part,
                          !formData.usedParts?.find((p) => p.id === id),
                        );
                    }}
                    onQuantityChange={(id, quantity) => {
                      handlePartQuantityChange(id, quantity);
                    }}
                    onClose={() => setNeedParts(false)}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
