import React, { ReactElement, useState } from "react";
import { Dialog, DialogFooter, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import ModalDialogConateiner from "./ModalDialogConateiner";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreateDialogContainerProps {
  title: string;
  description: string;
  children: ReactElement;
  isSaving: boolean;
  onCreate: () => void;
  onCancel: () => void;
}

export default function CreateDialogContainer({
  title,
  description,
  children,
  isSaving,
  onCreate,
  onCancel,
}: CreateDialogContainerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 gap-0 cursor-pointer max-md:flex-1">
          <Plus className="h-4 w-4" />
          <p className="truncate w-full">{isMobile ? "додаты" : title}</p>
        </Button>
      </DialogTrigger>
      {isDialogOpen && (
        <ModalDialogConateiner title={title} description={description}>
          {children}
          <DialogFooter className="flex flex-col space-y-2 sm:gap-0 items-center justify-center">
            <Button className="w-full" onClick={onCreate} disabled={isSaving}>
              {isSaving ? "Збереження..." : "Зберегти"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onCancel();
                setIsDialogOpen(false);
              }}
              className="w-full border-border border cursor-pointer"
            >
              Скасувати
            </Button>
          </DialogFooter>
        </ModalDialogConateiner>
      )}
    </Dialog>
  );
}
