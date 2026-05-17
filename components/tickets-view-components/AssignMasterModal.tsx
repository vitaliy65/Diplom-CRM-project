import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Ticket, UserProfile } from "@/lib/types";
import { useSelector, useDispatch } from "react-redux";
import { updateTicket } from "@/store/slices/tickets-slice";
import { selectTicketsSaving } from "@/store/slices/tickets-slice";
import { AppDispatch } from "@/store";
import { RootState } from "@/store";

type AssignMasterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
};

export function AssignMasterModal({
  open,
  onOpenChange,
  ticket,
}: AssignMasterModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(ticket.masterId);
  const users = useSelector((state: RootState) => state.users.items as UserProfile[]);
  const saving = useSelector(selectTicketsSaving);

  // Filter only active masters
  const activeMasters = users.filter((u) => u.role === "master" && u.active);

  useEffect(() => {
    // Reset to the current ticket master when the modal opens
    if (open) setSelectedMasterId(ticket.masterId);
  }, [open, ticket.masterId]);

  const handleAssign = async () => {
    if (selectedMasterId === ticket.masterId) {
      onOpenChange(false);
      return;
    }

    const selectedMaster = users.find((u) => u.id === selectedMasterId);
    await dispatch(
      updateTicket({
        id: ticket.id,
        data: {
          masterId: selectedMaster ? selectedMaster.id : null,
          masterName: selectedMaster ? selectedMaster.name : null,
        },
      })
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Призначити майстра</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 my-2">
          {activeMasters.length === 0 && (
            <span className="text-sm text-muted-foreground">Немає доступних майстрів</span>
          )}
          {activeMasters.map((master) => (
            <label
              key={master.id}
              className={`flex items-center gap-2 rounded p-2 cursor-pointer hover:bg-accent ${selectedMasterId === master.id ? "border-primary border" : ""}`}
            >
              <input
                type="radio"
                name="master"
                value={master.id}
                checked={selectedMasterId === master.id}
                onChange={() => setSelectedMasterId(master.id)}
                className="accent-primary"
              />
              <span className="font-medium text-sm">{master.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">({master.email})</span>
            </label>
          ))}
          <label
            className={`flex items-center gap-2 rounded p-2 cursor-pointer hover:bg-accent ${selectedMasterId === null ? "border-primary border" : ""}`}
          >
            <input
              type="radio"
              name="master"
              value=""
              checked={selectedMasterId === null}
              onChange={() => setSelectedMasterId(null)}
              className="accent-primary"
            />
            <span className="font-medium text-sm text-muted-foreground">Не призначено</span>
          </label>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Скасувати
          </Button>
          <Button
            onClick={handleAssign}
            disabled={saving || selectedMasterId === ticket.masterId}
          >
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

