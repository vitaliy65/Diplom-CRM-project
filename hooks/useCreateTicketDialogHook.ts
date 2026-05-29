import * as React from "react";
import { SpareParts, Ticket, UsedPartsTicket } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createTicketSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";
import { createTicket } from "@/store/slices/tickets-slice";
import { toast } from "sonner";

export function useCreateTicketDialogHook(
  clients: { id: string; name: string; phone: string }[],
) {
  const services = useAppSelector((s) => s.services.items);
  const spareParts = useAppSelector((s) => s.storage.items);

  const [formData, setFormData] = React.useState<Partial<Ticket>>({
    services: [],
    usedParts: [],
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [needParts, setNeedParts] = React.useState(false);
  const dispatch = useAppDispatch();

  const serviceOptions = React.useMemo(
    () =>
      Array.from(services).map((service) => ({
        value: service.id,
        label: service.name,
      })),
    [services],
  );

  const selectedServiceOptions = React.useMemo(
    () =>
      serviceOptions.filter((opt) => formData?.services?.includes(opt.value)),
    [serviceOptions, formData.services],
  );

  const handleServicesChange = React.useCallback(
    (selected: { value: string; label: string }[]) => {
      const selectedServiceIds = selected.map((opt) => opt.value);
      setFormData((prev) => ({
        ...prev,
        services: selectedServiceIds,
      }));
    },
    [],
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    },
    [],
  );

  const handleSparePartToggle = React.useCallback(
    (part: SpareParts, checked: boolean) => {
      setFormData((prev) => {
        // Ensure usedParts is always defined as an array
        const usedParts = Array.isArray(prev?.usedParts) ? prev.usedParts : [];
        const index = usedParts.findIndex((p) => p.id === part.id);
        if (checked && index === -1) {
          // Add new part with quantity "1" and correct name
          return {
            ...prev,
            usedParts: [
              ...usedParts,
              { id: part.id, name: part.name, quantity: 1 },
            ],
          };
        } else if (!checked && index !== -1) {
          // Remove this part
          return {
            ...prev,
            usedParts: usedParts.filter((p) => p.id !== part.id),
          };
        } else {
          return prev;
        }
      });
    },
    [],
  );

  const isPartChecked = React.useCallback(
    (part: SpareParts) => {
      return (
        Array.isArray(formData?.usedParts) &&
        formData.usedParts.some((p) => p.id === part.id)
      );
    },
    [formData.usedParts],
  );

  const handlePartQuantityChange = React.useCallback(
    (partId: string, value: string) => {
      let numericValue = parseInt(value.replace(/\D/g, ""), 10);
      const part = spareParts.find((p) => p.id === partId);
      if (Number.isNaN(numericValue) || numericValue < 1) numericValue = 1;
      if (part && numericValue > part.count) numericValue = part.count;
      setFormData((prev) => {
        const usedParts = Array.isArray(prev?.usedParts) ? prev.usedParts : [];
        return {
          ...prev,
          usedParts: usedParts.map((p) =>
            p.id === partId ? { ...p, quantity: numericValue } : p,
          ),
        };
      });
    },
    [spareParts],
  );

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const parsed = parseWithSchema(createTicketSchema, formData);
      if (!parsed.success) {
        toast.error(parsed.message);
        return;
      }

      const result = await dispatch(createTicket(parsed.data));
      if (createTicket.fulfilled.match(result)) {
        toast.success("Заявку збережено");
        setIsCreateDialogOpen(false);
      } else {
        toast.error((result.payload as string) || "Помилка збереження заявки");
      }
    },
    [formData, dispatch],
  );

  return {
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
  };
}
