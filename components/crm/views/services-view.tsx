"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import ViewContainer from "@/components/static/ViewContainer";
import ServiceContainerLayout from "@/components/view-components/service-view-components/ServiceContainerLayout";

export default function ServicesView() {
  // Like in tickets-view: implement scroll-to-selected if needed (skipped for services for now)

  return (
    <ViewContainer
      title="Сервіси / Послуги"
      description="Перелік усіх послуг сервісного центру"
    >
      <ServiceContainerLayout />
    </ViewContainer>
  );
}
