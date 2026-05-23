import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SelectedClientState = {
  id: string;
};

const initialState: SelectedClientState = {
  id: "",
};

const selectedClientSlice = createSlice({
  name: "selectedClient",
  initialState,
  reducers: {
    setSelectedClientId(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
    clearSelectedClient(state) {
      state.id = "";
    },
  },
});

export const { setSelectedClientId, clearSelectedClient } =
  selectedClientSlice.actions;
export default selectedClientSlice.reducer;
