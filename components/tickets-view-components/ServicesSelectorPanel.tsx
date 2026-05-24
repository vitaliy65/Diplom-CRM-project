"use client";

import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { selectServices } from "@/store/slices/services-slice";
import { Check, WrenchIcon } from "lucide-react";

type ServicesSelectorPanelProps = {
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function ServicesSelectorPanel({
  selectedIds,
  onToggle,
}: ServicesSelectorPanelProps) {
  const services = useAppSelector(selectServices);

  return (
    <motion.div
      initial={{ x: -340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -340, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-[300px] shrink-0 flex flex-col rounded-xl border border-border bg-background shadow-xl overflow-hidden self-stretch"
      style={{ zIndex: 9 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
        <WrenchIcon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Послуги</span>
        {selectedIds.length > 0 && (
          <span className="ml-auto text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {selectedIds.length} обрано
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1">
        {services.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Послуги не знайдено
          </p>
        ) : (
          services.map((service) => {
            const isSelected = selectedIds.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onToggle(service.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                  isSelected ? "bg-primary/5" : ""
                }`}
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
                    {service.name}
                  </span>
                  <span className="flex items-center gap-2 mt-0.5">
                    {service.discount > 0 ? (
                      <>
                        <span className="text-xs text-muted-foreground line-through">
                          {service.base_price} ₴
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {service.final_price} ₴
                        </span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded">
                          -{service.discount}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {service.base_price} ₴
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      {selectedIds.length > 0 && (
        <div className="border-t border-border px-4 py-2.5 bg-muted/40">
          <p className="text-xs text-muted-foreground">
            Загальна сума:{" "}
            <span className="font-semibold text-foreground">
              {services
                .filter((s) => selectedIds.includes(s.id))
                .reduce((sum, s) => sum + s.final_price, 0)}{" "}
              ₴
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
