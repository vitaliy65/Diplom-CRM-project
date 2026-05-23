"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import ViewContainer from "@/components/static/ViewContainer";
import ClientsContainerLayout from "@/components/clients-view-components/ClientsContainerLayout";

export function ClientsView() {
  // Any scroll to selected logic or side effect could go here in the future, analogous to TicketsView.
  // (For now, left minimal like TicketsView)

  return (
    <ViewContainer
      title="Клієнти"
      description="База даних клієнтів сервісного центру"
    >
      <ClientsContainerLayout />
    </ViewContainer>
  );
}
