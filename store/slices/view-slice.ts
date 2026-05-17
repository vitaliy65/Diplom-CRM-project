import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

interface ViewState {
  activeView: string;
}

const initialViewState: ViewState = {
  activeView: "dashboard",
};

const viewSlice = createSlice({
  name: "view",
  initialState: initialViewState,
  reducers: {
    setActiveView: (state, action: PayloadAction<string>) => {
      state.activeView = action.payload;
    },
  },
});

export const { setActiveView } = viewSlice.actions;

export const selectActiveView = (state: RootState) => state.view.activeView;

export const viewReducer = viewSlice.reducer;
