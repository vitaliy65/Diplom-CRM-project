import React, { useState } from "react";
import DialogInput from "@/components/DialogInput";
import CreateDialogContainer from "@/components/CreateDialogContainer";
import { useAppDispatch } from "@/store/hooks";
import { createClient } from "@/store/slices/clients-slice";
import { toast } from "sonner";
import { clientSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";

type ClientFormInitial = {
  name: string;
  phone: string;
  email: string;
};

type ClientFormProps = {
  initial?: ClientFormInitial;
  saving?: boolean;
};

export function CreateClientDialog({
  initial,
  saving = false,
}: ClientFormProps = {}) {
  const [formData, setFormData] = useState<ClientFormInitial>({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
  });
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const parsed = parseWithSchema(clientSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.message);
      setIsSubmitting(false);
      return;
    }
    const result = await dispatch(createClient(parsed.data));
    setIsSubmitting(false);

    if (createClient.fulfilled.match(result)) {
      toast.success("Клієнта додано");
    } else {
      toast.error((result.payload as string) || "Помилка додавання клієнта");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: initial?.name ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
    });
  };

  return (
    <CreateDialogContainer
      title="Новий клієнт"
      description="Додайте нового клієнта до бази даних"
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
          label="ПІБ"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Іванов Іван Іванович"
        />
        <DialogInput
          name="phone"
          label="Телефон"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+380 XX XXX XXXX"
        />
        <DialogInput
          name="email"
          label="Email"
          value={formData.email}
          type="email"
          onChange={handleInputChange}
          placeholder="email@example.com"
        />
      </form>
    </CreateDialogContainer>
  );
}
