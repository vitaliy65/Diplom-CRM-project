import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SelectedMasterState = {
  id: string;
};

const initialState: SelectedMasterState = {
  id: "",
};

const selectedMasterSlice = createSlice({
  name: "selectedMaster",
  initialState,
  reducers: {
    setSelectedMasterId(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
    clearSelectedMaster(state) {
      state.id = "";
    },
  },
});

export const { setSelectedMasterId, clearSelectedMaster } =
  selectedMasterSlice.actions;
export default selectedMasterSlice.reducer;
