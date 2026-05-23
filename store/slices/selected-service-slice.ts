import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SelectedServiceState = {
  id: string;
};

const initialState: SelectedServiceState = {
  id: "",
};

const selectedServiceSlice = createSlice({
  name: "selectedService",
  initialState,
  reducers: {
    setSelectedServiceId(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
    clearSelectedService(state) {
      state.id = "";
    },
  },
});

export const { setSelectedServiceId, clearSelectedService } =
  selectedServiceSlice.actions;
export default selectedServiceSlice.reducer;
