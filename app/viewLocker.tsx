import React from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/store/slices/auth-slice";
import { menuItems } from "@/static/MenuItems";
import { usePathname, useRouter } from "next/navigation";

export default function ViewLocker({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector(selectCurrentUser);
  const pathname = usePathname();
  const router = useRouter();

  // derive current menu item by matching url to pathname (assuming exact match)
  const matchedMenuItem = menuItems.find((item) => item.url === pathname);

  // If route does not exist in menu, allow access (fallback to allow)
  if (!matchedMenuItem) {
    return <>{children}</>;
  }

  // Check if user exists and their role matches menu item allowed roles
  const canAccess =
    user && matchedMenuItem.roles && matchedMenuItem.roles.includes(user.role);

  if (!canAccess) {
    // Optionally, redirect to dashboard or show error
    // router.replace("/dashboard"); // Uncomment to auto-redirect
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold text-red-500">
        У вас немає доступу до цієї сторінки.
      </div>
    );
  }

  return <>{children}</>;
}
