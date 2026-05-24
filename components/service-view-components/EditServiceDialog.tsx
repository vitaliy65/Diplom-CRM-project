import { useAppDispatch } from "@/store/hooks";
import { Dialog, DialogContent } from "../ui/dialog";
import { AnimatePresence } from "framer-motion";
import { CreateServiceDialog } from "./CreateServiceDialog";
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
              <CreateServiceDialog initial={editingService} saving={saving} />
            </div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
