import Loading from "@/components/Loading";
import ViewContainer from "@/components/static/ViewContainer";
import React from "react";

export default function loading() {
  return (
    <ViewContainer
      title="Склад / Запчастини"
      description="Перелік запчастин та матеріалів на складі сервісного центру"
    >
      <Loading />
    </ViewContainer>
  );
}
