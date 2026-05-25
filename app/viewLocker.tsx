"use client";

import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectCurrentUser,
  selectIsAuthLoading,
} from "@/store/slices/auth-slice";
import { menuItems } from "@/static/MenuItems";
import { usePathname, useRouter } from "next/navigation";

export default function ViewLocker({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector(selectCurrentUser);
  const authLoading = useAppSelector(selectIsAuthLoading);
  const pathname = usePathname();
  const router = useRouter();

  const matchedMenuItem = menuItems.find((item) => item.url === pathname);

  const canAccess =
    !matchedMenuItem ||
    Boolean(
      user &&
      matchedMenuItem.roles &&
      matchedMenuItem.roles.includes(user.role),
    );

  const fallbackUrl =
    menuItems.find((item) => item.roles.includes(user?.role ?? ""))?.url ??
    "/dashboard";

  useEffect(() => {
    if (authLoading || !matchedMenuItem || canAccess) return;
    if (pathname !== fallbackUrl) {
      router.replace(fallbackUrl);
    }
  }, [authLoading, matchedMenuItem, canAccess, pathname, fallbackUrl, router]);

  if (authLoading) {
    return <>{children}</>;
  }

  if (!matchedMenuItem) {
    return <>{children}</>;
  }

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-red-500">
        У вас немає доступу до цієї сторінки.
      </div>
    );
  }

  return <>{children}</>;
}
