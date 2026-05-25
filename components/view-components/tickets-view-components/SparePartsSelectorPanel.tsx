"use client";

import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { selectStorage } from "@/store/slices/storage-slice";
import type { UsedPartsTicket } from "@/lib/types";
import { Check, PackageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

type SparePartsSelectorPanelProps = {
  selectedParts: UsedPartsTicket[];
  onToggle: (id: string, name: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
};

export function SparePartsSelectorPanel({
  selectedParts,
  onToggle,
  onQuantityChange,
}: SparePartsSelectorPanelProps) {
  const parts = useAppSelector(selectStorage);

  const getSelected = (id: string) => selectedParts.find((p) => p.id === id);

  return (
    <motion.div
      initial={{ x: -340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -340, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280, delay: 0.04 }}
      className="w-[300px] shrink-0 flex flex-col rounded-xl border border-border bg-background shadow-xl overflow-hidden self-stretch"
      style={{ zIndex: 8 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
        <PackageIcon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          Запчастини
        </span>
        {selectedParts.length > 0 && (
          <span className="ml-auto text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {selectedParts.length} обрано
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1">
        {parts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Запчастини не знайдено
          </p>
        ) : (
          parts.map((part) => {
            const selected = getSelected(part.id);
            const isSelected = !!selected;
            const isOutOfStock = part.count === 0;

            return (
              <div
                key={part.id}
                className={`px-4 py-3 transition-colors ${
                  isSelected ? "bg-primary/5" : ""
                } ${isOutOfStock ? "opacity-50" : ""}`}
              >
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => onToggle(part.id, part.name)}
                  className="w-full flex items-start gap-3 text-left"
                >
                  {/* Checkbox visual */}
                  <span
                    className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border bg-background"
                    }`}
                  >
                    {isSelected && (
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    )}
                  </span>

                  {/* Info */}
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-foreground truncate">
                      {part.name}
                    </span>
                    <span className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {part.priceForOne} ₴/шт
                      </span>
                      <span
                        className={`text-[10px] px-1 rounded ${
                          part.count > 5
                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                            : part.count > 0
                              ? "text-amber-600 bg-amber-50 dark:bg-amber-950"
                              : "text-red-500 bg-red-50 dark:bg-red-950"
                        }`}
                      >
                        {part.count > 0 ? `${part.count} шт` : "Немає"}
                      </span>
                    </span>
                  </span>
                </button>

                {/* Quantity input — visible only when selected */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 ml-7 flex items-center gap-2"
                  >
                    <span className="text-xs text-muted-foreground">
                      К-сть:
                    </span>
                    <Input
                      type="number"
                      min="1"
                      max={part.count}
                      value={selected?.quantity ?? "1"}
                      onChange={(e) => {
                        let n = parseInt(e.target.value, 10);
                        if (Number.isNaN(n) || n < 1) n = 1;
                        if (n > part.count) n = part.count;
                        onQuantityChange(part.id, n);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 w-20 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">
                      ={" "}
                      {(
                        (Number(selected?.quantity) || 1) * part.priceForOne
                      ).toFixed(0)}{" "}
                      ₴
                    </span>
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {selectedParts.length > 0 && (
        <div className="border-t border-border px-4 py-2.5 bg-muted/40">
          <p className="text-xs text-muted-foreground">
            Загальна вартість:{" "}
            <span className="font-semibold text-foreground">
              {parts
                .filter((p) => selectedParts.find((sp) => sp.id === p.id))
                .reduce((sum, p) => {
                  const sp = selectedParts.find((s) => s.id === p.id);
                  return sum + p.priceForOne * (Number(sp?.quantity) || 1);
                }, 0)
                .toFixed(0)}{" "}
              ₴
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
