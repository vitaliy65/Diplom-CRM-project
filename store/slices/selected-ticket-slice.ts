import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SelectedTicketState = {
  id: string;
};

const initialState: SelectedTicketState = {
  id: "",
};

const selectedTicketSlice = createSlice({
  name: "selectedTicket",
  initialState,
  reducers: {
    setSelectedTicketId(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
    clearSelectedTicket(state) {
      state.id = "";
    },
  },
});

export const { setSelectedTicketId, clearSelectedTicket } =
  selectedTicketSlice.actions;
export default selectedTicketSlice.reducer;
