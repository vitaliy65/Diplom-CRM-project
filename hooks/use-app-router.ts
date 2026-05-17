// lib/hooks/use-app-router.ts
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useAppRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = useCallback((path: string) => router.push(path), [router]);

  const replace = useCallback((path: string) => router.replace(path), [router]);

  const back = useCallback(() => router.back(), [router]);

  // Хелпер для работы с query params
  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const removeParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return {
    router,
    pathname,
    searchParams,
    navigate,
    replace,
    back,
    setParam,
    removeParam,
  };
}
