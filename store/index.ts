import { configureStore } from "@reduxjs/toolkit"
import authReducer from "@/store/slices/auth-slice"
import ticketsReducer from "@/store/slices/tickets-slice"
import clientsReducer from "@/store/slices/clients-slice"
import usersReducer from "@/store/slices/users-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketsReducer,
    clients: clientsReducer,
    users: usersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
