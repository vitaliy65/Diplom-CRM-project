"use client";

import ViewContainer from "@/components/static/ViewContainer";
import StorageContainerLayout from "@/components/storage-view-components/StorageContainerLayout";

export default function StorageView() {
  return (
    <ViewContainer
      title="Склад / Запчастини"
      description="Перелік запчастин та матеріалів на складі сервісного центру"
    >
      <StorageContainerLayout />
    </ViewContainer>
  );
}
