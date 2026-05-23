import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SelectedPartState = {
  id: string;
};

const initialState: SelectedPartState = {
  id: "",
};

const selectedPartSlice = createSlice({
  name: "selectedPart",
  initialState,
  reducers: {
    setSelectedPartId(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
    clearSelectedPart(state) {
      state.id = "";
    },
  },
});

export const { setSelectedPartId, clearSelectedPart } =
  selectedPartSlice.actions;
export default selectedPartSlice.reducer;
