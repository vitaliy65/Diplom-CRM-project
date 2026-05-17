import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
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
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(
    ticket.masterId,
  );
  const users = useSelector(
    (state: RootState) => state.users.items as UserProfile[],
  );
  const saving = useSelector(selectTicketsSaving);

  // Only active masters
  const activeMasters = users.filter((u) => u.role === "master" && u.active);

  useEffect(() => {
    // Reset when modal opens
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
      }),
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-secondary max-w-sm">
        <DialogHeader>
          <DialogTitle>Призначити майстра</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 my-2">
          {activeMasters.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Немає доступних майстрів
            </span>
          ) : (
            <select
              className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
              value={selectedMasterId ?? ""}
              onChange={(e) => {
                setSelectedMasterId(
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              disabled={saving}
            >
              <option value="">Не призначено</option>
              {activeMasters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.name} ({master.email})
                </option>
              ))}
            </select>
          )}
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
