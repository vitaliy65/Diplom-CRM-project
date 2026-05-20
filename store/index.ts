import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/auth-slice";
import ticketsReducer from "@/store/slices/tickets-slice";
import clientsReducer from "@/store/slices/clients-slice";
import usersReducer from "@/store/slices/users-slice";
import selectedTicketReducer from "@/store/slices/selected-ticket-slice";
import { viewReducer } from "@/store/slices/view-slice";
import servicesReducer from "@/store/slices/services-slice";
import storageReducer from "@/store/slices/storage-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketsReducer,
    clients: clientsReducer,
    users: usersReducer,
    selectedTicket: selectedTicketReducer,
    view: viewReducer,
    services: servicesReducer,
    storage: storageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
