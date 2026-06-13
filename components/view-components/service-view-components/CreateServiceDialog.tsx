import React, { useState } from "react";
import DialogInput from "@/components/DialogInput";
import type { Service } from "@/lib/types";
import CreateDialogContainer from "@/components/CreateDialogContainer";
import { useAppDispatch } from "@/store/hooks";
import { createService } from "@/store/slices/services-slice";
import { toast } from "sonner";
import { serviceSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";

type ServiceFormInitial = Omit<Service, "id">;

type ServiceFormProps = {
  initial?: ServiceFormInitial;
  saving?: boolean;
};

export function CreateServiceDialog({
  initial,
  saving = false,
}: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormInitial>({
    name: initial?.name ?? "",
    base_price: initial?.base_price ?? 0,
    final_price: initial?.final_price ?? 0,
    discount: initial?.discount ?? 0,
  });
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Math.max(0, Number(value)),
    }));
  };

  // This function will be called by CreateDialogContainer when user presses "Зберегти"
  const handleCreate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const parsed = parseWithSchema(serviceSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.message);
      setIsSubmitting(false);
      return;
    }
    const result = await dispatch(createService(parsed.data));
    setIsSubmitting(false);

    if (createService.fulfilled.match(result)) {
      toast.success("Сервіс додано");
    } else {
      toast.error(
        (result.payload as string) || "Помилка під час додавання сервісу",
      );
    }
  };

  // Optional cancel handler if parent needs to react to dialog cancel, here just resets state
  const handleCancel = () => {
    setFormData({
      name: initial?.name ?? "",
      base_price: initial?.base_price ?? 0,
      final_price: initial?.final_price ?? 0,
      discount: initial?.discount ?? 0,
    });
  };

  return (
    <CreateDialogContainer
      title="Новий сервіс"
      description="Заповніть поля для створення нового сервісу"
      isSaving={saving || isSubmitting}
      onCreate={handleCreate}
      onCancel={handleCancel}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <DialogInput
          name="name"
          label="Назва"
          value={formData.name}
          onChange={handleInputChange}
        />
        <DialogInput
          name="base_price"
          label="Базова вартість (₴)"
          value={formData.base_price}
          onChange={handleInputChange}
        />
        <DialogInput
          name="final_price"
          label="Фінальна вартість (₴)"
          value={formData.final_price}
          onChange={handleInputChange}
        />
      </form>
    </CreateDialogContainer>
  );
}
