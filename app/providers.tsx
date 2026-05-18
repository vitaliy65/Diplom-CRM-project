"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { subscribeAuth } from "@/store/slices/auth-slice";
import { subscribeTickets } from "@/store/slices/tickets-slice";
import { subscribeClients } from "@/store/slices/clients-slice";
import { subscribeUsers } from "@/store/slices/users-slice";
import { subscribeServices } from "@/store/slices/services-slice";

function AppBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(subscribeAuth());
    dispatch(subscribeTickets());
    dispatch(subscribeClients());
    dispatch(subscribeUsers());
    dispatch(subscribeServices());
  }, [dispatch]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppBootstrap />
      {children}
      <Toaster richColors position="top-right" />
    </Provider>
  );
}
