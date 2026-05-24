import Loading from "@/components/Loading";
import ViewContainer from "@/components/static/ViewContainer";
import React from "react";

export default function loading() {
  return (
    <ViewContainer
      title="Налаштування акаунту"
      description="Керування особистою інформацією, email та паролем"
    >
      <Loading />
    </ViewContainer>
  );
}
