import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateTicket } from "@/store/slices/tickets-slice";
import { editTicketPanelSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";
import { enrichUsedParts } from "@/lib/storage-stock";
import { selectStorage } from "@/store/slices/storage-slice";
import { selectCurrentUser } from "@/store/slices/auth-slice";
import { toast } from "sonner";
import type { Ticket } from "@/lib/types";
import { selectMasters } from "@/store/slices/users-slice";
// Import the action for updating storage sparepart quantities
import { updateSparePartQuantity } from "@/store/slices/storage-slice";
import { useIsMobile } from "@/hooks/use-mobile";

const emptyTicketFields: Omit<Ticket, "id" | "isEmailDelivered"> = {
  clientId: "",
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  device: "",
  problem: "",
  status: "received",
  masterId: "",
  masterName: "",
  createdAt: "",
  readyAt: "",
  slaViolation: false,
  comments: [],
  services: [],
  usedParts: [],
};

type UseEditTicketDialogProps = {
  editingTicket: Ticket | null;
  setEditingTicket: (ticket: Ticket | null) => void;
  saving: boolean;
};

export function useEditTicketDialog({
  editingTicket,
  setEditingTicket,
  saving,
}: UseEditTicketDialogProps) {
  const dispatch = useAppDispatch();
  const masters = useAppSelector(selectMasters);
  const currentUser = useAppSelector(selectCurrentUser);
  const storage = useAppSelector(selectStorage);
  const isMobile = useIsMobile();

  const [formData, setFormData] =
    useState<Omit<Ticket, "id" | "isEmailDelivered">>(emptyTicketFields);
  const [showServices, setShowServices] = useState(false);
  const [showParts, setShowParts] = useState(false);
  const oldSparPartsCount = editingTicket?.usedParts;

  useEffect(() => {
    if (editingTicket) {
      const { id, ...rest } = editingTicket;
      setFormData({ ...emptyTicketFields, ...rest });
    } else {
      setFormData(emptyTicketFields);
      setShowServices(false);
      setShowParts(false);
    }
  }, [editingTicket]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === "masterId") {
      const selectedMaster = masters.find((m) => m.id === value);
      setFormData((prev) => ({
        ...prev,
        masterId: value,
        masterName: selectedMaster ? selectedMaster.name : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleService = useCallback((id: string) => {
    setFormData((prev) => {
      const already = prev.services.includes(id);
      return {
        ...prev,
        services: already
          ? prev.services.filter((s) => s !== id)
          : [...prev.services, id],
      };
    });
  }, []);

  const handleTogglePart = useCallback((id: string, name: string) => {
    setFormData((prev) => {
      const exists = prev.usedParts.find((p) => p.id === id);
      return {
        ...prev,
        usedParts: exists
          ? prev.usedParts.filter((p) => p.id !== id)
          : [...prev.usedParts, { id, name, quantity: 1 }],
      };
    });
  }, []);

  const handlePartQuantityChange = useCallback(
    (id: string, quantity: number) => {
      setFormData((prev) => ({
        ...prev,
        usedParts: prev.usedParts.map((p) =>
          p.id === id ? { ...p, quantity } : p,
        ),
      }));
    },
    [],
  );

  // Submit - update ticket, update stock
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    if (!formData.services || formData.services.length === 0) {
      toast.error("Оберіть хоча б одну послугу для оновлення тікету.");
      return;
    }

    // Payload for ticket update
    const panelPayload = {
      status: formData.status,
      masterId: formData.masterId || null,
      masterName: formData.masterName,
      services: formData.services,
      usedParts: enrichUsedParts(formData.usedParts, storage),
    };

    const parsed = parseWithSchema(editTicketPanelSchema, panelPayload);
    if (!parsed.success) {
      toast.error(parsed.message);
      return;
    }

    try {
      // Update spare parts quantities in storage
      // Logic: for each used part, find its old value (if present), and update storage only if quantity changed.
      formData.usedParts.forEach(async (part) => {
        if (part.quantity > 0 && oldSparPartsCount) {
          const oldPart = oldSparPartsCount.find((p) => p.id === part.id);
          const oldQuantity = oldPart ? oldPart.quantity : 0;

          // Only update if quantity is different
          if (oldQuantity !== part.quantity) {
            const quantity = Math.abs(oldQuantity - part.quantity);
            const action =
              oldQuantity < part.quantity ? "decrease" : "increase";

            await dispatch(
              updateSparePartQuantity({
                id: part.id,
                amount: quantity,
                action,
              }),
            );
          }
        }
      });
    } catch (err) {
      toast.error("Не вдалось оновити залишки запчастин.");
      return;
    }

    // Update the ticket after successfully updating spare parts
    const result = await dispatch(
      updateTicket({ id: editingTicket.id, data: parsed.data }),
    );
    if ((updateTicket as any).fulfilled.match(result)) {
      toast.success("Тікет оновлено");
      setEditingTicket(null);
    } else {
      toast.error(
        (result.payload as string) || "Помилка під час оновлення тікету",
      );
    }
  };

  const handleClose = () => setEditingTicket(null);

  return {
    formData,
    showServices,
    showParts,
    masters,
    currentUser,
    isMobile,
    handleChange,
    handleToggleService,
    handleTogglePart,
    handlePartQuantityChange,
    handleSubmit,
    handleClose,
    setShowServices,
    setShowParts,
  };
}
