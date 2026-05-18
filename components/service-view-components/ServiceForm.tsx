import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/types";

type ServiceFormInitial = Omit<Service, "id">;

type ServiceFormProps = {
  initial?: ServiceFormInitial;
  onSubmit: (data: ServiceFormInitial) => void;
  saving?: boolean;
};

export function ServiceForm({ initial, onSubmit, saving }: ServiceFormProps) {
  const [form, setForm] = useState<ServiceFormInitial>({
    name: initial?.name ?? "",
    base_price: initial?.base_price ?? 0,
    final_price: initial?.final_price ?? 0,
    discount: initial?.discount ?? 0,
  });

  const handleChange =
    (field: keyof ServiceFormInitial) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "name" ? e.target.value : Math.max(0, +e.target.value); // Неотрицательные для цен и скидки
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      base_price: Number(form.base_price),
      final_price: Number(form.final_price),
      discount: Number(form.discount),
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Назва
        </label>
        <Input
          value={form.name}
          onChange={handleChange("name")}
          placeholder="Наприклад, Діагностика"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Базова вартість (₴)
        </label>
        <Input
          value={form.base_price}
          type="number"
          min={0}
          onChange={handleChange("base_price")}
          placeholder="Базова ціна"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Фінальна вартість (₴)
        </label>
        <Input
          value={form.final_price}
          type="number"
          min={0}
          onChange={handleChange("final_price")}
          placeholder="Фінальна ціна"
          required
        />
      </div>
      <Button className="w-full mt-2" type="submit" disabled={saving}>
        {saving ? "Збереження..." : "Зберегти"}
      </Button>
    </form>
  );
}
