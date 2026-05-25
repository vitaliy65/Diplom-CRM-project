import { collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SpareParts, UsedPartsTicket } from "@/lib/types";
import {
  applyDeltasToCounts,
  buildStockDeltas,
  validateStockForDeduction,
} from "@/lib/storage-stock";

/** Застосовує дельти до Firestore storage та повертає помилку, якщо недостатньо залишку */
export async function commitStockDeltas(
  storageItems: SpareParts[],
  restoreParts: UsedPartsTicket[],
  deductParts: UsedPartsTicket[],
): Promise<string | null> {
  if (!db) return "Firebase не налаштований.";

  const deltas = buildStockDeltas(restoreParts, deductParts);
  if (deltas.size === 0) return null;

  const stockError = validateStockForDeduction(
    deductParts,
    storageItems,
    deltas,
  );
  if (stockError) return stockError;

  const nextItems = applyDeltasToCounts(storageItems, deltas);
  for (const item of nextItems) {
    const delta = deltas.get(item.id);
    if (delta === undefined) continue;
    const original = storageItems.find((s) => s.id === item.id);
    if (!original || original.count === item.count) continue;
    await updateDoc(doc(collection(db, "storage"), item.id), {
      count: item.count,
    });
  }
  return null;
}
