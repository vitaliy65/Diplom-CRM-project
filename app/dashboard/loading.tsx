import Loading from "@/components/Loading";
import ViewContainer from "@/components/static/ViewContainer";
import React from "react";

export default function loading() {
  return (
    <ViewContainer
      title="Дашборд"
      description="Огляд активності сервісного центру"
    >
      <Loading />
    </ViewContainer>
  );
}
