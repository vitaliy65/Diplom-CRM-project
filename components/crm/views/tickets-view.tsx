"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import ViewContainer from "@/components/static/ViewContainer";
import TicketContainerLayout from "@/components/view-components/tickets-view-components/TicketContainerLayout";

export function TicketsView() {
  const selectedTicketId = useAppSelector((s) => s.selectedTicket.id);

  useEffect(() => {
    if (selectedTicketId) {
      const el = document.getElementById("selected-ticket");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedTicketId]);

  return (
    <ViewContainer
      title="Заявки"
      description="Kanban-дошка управління заявками"
    >
      <TicketContainerLayout />
    </ViewContainer>
  );
}
