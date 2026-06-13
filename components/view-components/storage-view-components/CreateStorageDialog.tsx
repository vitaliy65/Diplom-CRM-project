import React, { useState } from "react";
import DialogInput from "@/components/DialogInput";
import type { SpareParts } from "@/lib/types";
import CreateDialogContainer from "@/components/CreateDialogContainer";
import { useAppDispatch } from "@/store/hooks";
import { createSparePart } from "@/store/slices/storage-slice";
import { toast } from "sonner";
import { sparePartSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";

type SparePartFormInitial = Omit<SpareParts, "id">;

type SparePartFormProps = {
  initial?: SparePartFormInitial;
  saving?: boolean;
};

export function CreateStorageDialog({
  initial,
  saving = false,
}: SparePartFormProps = {}) {
  const [formData, setFormData] = useState<SparePartFormInitial>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    count: initial?.count ?? 0,
    priceForOne: initial?.priceForOne ?? 0,
  });
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "count" || name === "priceForOne"
          ? Math.max(0, Number(value))
          : value,
    }));
  };

  // This function will be called by CreateDialogContainer when user presses "Зберегти"
  const handleCreate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const parsed = parseWithSchema(sparePartSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.message);
      setIsSubmitting(false);
      return;
    }
    const result = await dispatch(createSparePart(parsed.data));
    setIsSubmitting(false);

    if (createSparePart.fulfilled.match(result)) {
      toast.success("Запчастину додано");
    } else {
      toast.error(
        (result.payload as string) || "Помилка під час додавання запчастини",
      );
    }
  };

  // Optional cancel handler if parent needs to react to dialog cancel, here just resets state
  const handleCancel = () => {
    setFormData({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      count: initial?.count ?? 0,
      priceForOne: initial?.priceForOne ?? 0,
    });
  };

  return (
    <CreateDialogContainer
      title="Нова запчастина"
      description="Додайте нову запчастину на склад"
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
          label="Назва"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
        <DialogInput
          label="Опис"
          name="description"
          value={formData.description ?? ""}
          onChange={handleInputChange}
        />
        <DialogInput
          label="Кількість"
          name="count"
          value={formData.count}
          placeholder="0"
          onChange={handleInputChange}
        />
        <DialogInput
          label="Ціна за одиницю"
          name="priceForOne"
          value={formData.priceForOne}
          placeholder="0.00"
          onChange={handleInputChange}
        />
      </form>
    </CreateDialogContainer>
  );
}

export default CreateStorageDialog;
