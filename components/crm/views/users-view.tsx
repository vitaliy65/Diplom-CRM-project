"use client";
import UsersContainerLayout from "@/components/users-view-components/UsersContainerLayout";
import ViewContainer from "@/components/static/ViewContainer";

export function UsersView() {
  return (
    <ViewContainer
      title="Користувачі"
      description="Адмін панель управління користувачами"
    >
      <UsersContainerLayout />
    </ViewContainer>
  );
}
