import { useAppDispatch } from "@/store/hooks";
import { Dialog, DialogContent } from "../ui/dialog";
import { AnimatePresence } from "framer-motion";
import { ServiceForm } from "./ServiceForm";
import { updateService } from "@/store/slices/services-slice";
import { toast } from "sonner";
import { Service } from "@/lib/types";

type EditServiceDialogProps = {
  editingService: Service | null;
  setEditingService: (service: Service | null) => void;
  saving: boolean;
};

export function EditServiceDialog({
  editingService,
  setEditingService,
  saving,
}: EditServiceDialogProps) {
  const dispatch = useAppDispatch();

  return (
    <Dialog
      open={!!editingService}
      onOpenChange={(open) => !open && setEditingService(null)}
    >
      <AnimatePresence>
        {editingService && (
          <DialogContent className="flex items-center justify-center">
            <div className="w-full">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Редагування сервісу
              </h3>
              <ServiceForm
                initial={editingService}
                saving={saving}
                onSubmit={async (data) => {
                  // Calculate discount based on base_price and final_price
                  // discount = (base_price - final_price) / base_price * 100
                  let discount = 0;
                  if (data.base_price > 0) {
                    discount = Math.round(
                      ((data.base_price - data.final_price) / data.base_price) *
                        100,
                    );
                  }
                  const updatePayload = {
                    id: editingService.id,
                    data: {
                      name: data.name,
                      base_price: data.base_price,
                      final_price: data.final_price,
                      discount,
                    },
                  };
                  const result = await dispatch(updateService(updatePayload));
                  if (updateService.fulfilled.match(result)) {
                    toast.success("Сервіс оновлено");
                    setEditingService(null);
                  } else {
                    toast.error(
                      (result.payload as string) ||
                        "Помилка під час оновлення сервісу",
                    );
                  }
                }}
              />
            </div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
