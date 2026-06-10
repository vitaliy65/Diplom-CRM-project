"use client";
import ViewContainer from "@/components/static/ViewContainer";
import TicketContainerLayout from "@/components/view-components/tickets-view-components/TicketContainerLayout";

export function TicketsView() {
  return (
    <ViewContainer
      title="Заявки"
      description="Kanban-дошка управління заявками"
    >
      <TicketContainerLayout />
    </ViewContainer>
  );
}
