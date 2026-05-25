import type { SpareParts, UsedPartsTicket } from "@/lib/types";

/** Доповнює name з каталогу складу (у Firestore часто лише id + quantity) */
export function enrichUsedParts(
  parts: UsedPartsTicket[] | undefined,
  storageItems: SpareParts[],
): UsedPartsTicket[] {
  if (!parts?.length) return [];
  return parts.map((part) => ({
    id: part.id,
    quantity: normalizePartQuantity(part.quantity),
    name:
      (part.name && String(part.name).trim()) ||
      storageItems.find((s) => s.id === part.id)?.name ||
      "Запчастина",
  }));
}

export function normalizePartQuantity(quantity: string | number): number {
  const n =
    typeof quantity === "number" ? quantity : parseInt(String(quantity), 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
}

/** Позитивний delta = повернути на склад, негативний = списати */
export function buildStockDeltas(
  restoreParts: UsedPartsTicket[],
  deductParts: UsedPartsTicket[],
): Map<string, number> {
  const deltas = new Map<string, number>();
  for (const part of restoreParts) {
    const qty = normalizePartQuantity(part.quantity);
    deltas.set(part.id, (deltas.get(part.id) ?? 0) + qty);
  }
  for (const part of deductParts) {
    const qty = normalizePartQuantity(part.quantity);
    deltas.set(part.id, (deltas.get(part.id) ?? 0) - qty);
  }
  return deltas;
}

export function validateStockForDeduction(
  deductParts: UsedPartsTicket[],
  storageItems: SpareParts[],
  deltas?: Map<string, number>,
): string | null {
  const toDeduct = deltas ?? buildStockDeltas([], deductParts);
  for (const [partId, delta] of toDeduct) {
    if (delta >= 0) continue;
    const need = Math.abs(delta);
    const stock = storageItems.find((s) => s.id === partId);
    const partName = deductParts.find((p) => p.id === partId)?.name ?? partId;
    if (!stock) {
      return `Запчастину «${partName}» не знайдено на складі`;
    }
    if (stock.count < need) {
      return `Недостатньо «${partName}» на складі (є ${stock.count}, потрібно ${need})`;
    }
  }
  return null;
}

export function applyDeltasToCounts(
  storageItems: SpareParts[],
  deltas: Map<string, number>,
): SpareParts[] {
  return storageItems.map((item) => {
    const delta = deltas.get(item.id);
    if (delta === undefined) return item;
    return { ...item, count: Math.max(0, item.count + delta) };
  });
}
