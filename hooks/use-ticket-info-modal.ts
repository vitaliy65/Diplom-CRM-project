import { useCallback, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTicket,
  selectTicketsSaving,
} from "@/store/slices/tickets-slice";
import { AppDispatch, RootState } from "@/store";
import { useIsMobile } from "@/hooks/use-mobile";
import { Ticket, UserProfile } from "@/lib/types";

/**
 * Усечение текста, если его слишком много
 */
function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

const MOBILE_LENGTHS = {
  clientName: 24,
  phone: 22,
  device: 26,
  problem: 72,
  comment: 70,
  service: 35,
};

export function useTicketInfoModal({
  ticket,
  open,
  onOpenChange,
}: {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(
    ticket.masterId,
  );
  const users = useSelector(
    (state: RootState) => state.users.items as UserProfile[],
  );
  const saving = useSelector(selectTicketsSaving);
  const isMobile = useIsMobile();

  // Only active masters
  const activeMasters = users.filter((u) => u.role === "master" && u.active);

  useEffect(() => {
    if (open) setSelectedMasterId(ticket.masterId);
  }, [open, ticket.masterId]);

  const handleAssign = useCallback(async () => {
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
  }, [selectedMasterId, ticket, users, dispatch, onOpenChange]);

  const handleDeliver = useCallback(async () => {
    if (ticket.status === "delivered") {
      onOpenChange(false);
      return;
    }
    await dispatch(
      updateTicket({
        id: ticket.id,
        data: { status: "delivered" },
      }),
    );
    onOpenChange(false);
  }, [ticket, dispatch, onOpenChange]);

  const getDisplay = useCallback(
    (value: any, mobileMaxLength?: number) => {
      if (typeof value === "string") {
        return isMobile && mobileMaxLength
          ? truncateText(value, mobileMaxLength)
          : value;
      }
      return value;
    },
    [isMobile],
  );

  // services строка, как массив строк для дальнейшего отображения
  let servicesArray: string[] = [];
  if (Array.isArray(ticket.services) && ticket.services.length > 0) {
    servicesArray = ticket.services.map((service: any) => {
      return typeof service === "string"
        ? getDisplay(service, MOBILE_LENGTHS.service)
        : getDisplay(
            service?.name || service?.title || service?.label || "",
            MOBILE_LENGTHS.service,
          );
    });
  }

  // comments, как массив строк для дальнейшего отображения
  let commentsArray: string[] = [];
  if (Array.isArray(ticket.comments) && ticket.comments.length > 0) {
    commentsArray = ticket.comments.map((c: any) =>
      getDisplay(c, MOBILE_LENGTHS.comment),
    );
  }

  return {
    selectedMasterId,
    setSelectedMasterId,
    activeMasters,
    saving,
    isMobile,
    handleAssign,
    handleDeliver,
    getDisplay,
    servicesArray,
    commentsArray,
    truncateText,
    MOBILE_LENGTHS,
    users,
  };
}
