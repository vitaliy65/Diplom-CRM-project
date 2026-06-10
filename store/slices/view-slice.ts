import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

interface ViewState {
  activeView: string;
  selectedId: string;
}

const initialViewState: ViewState = {
  activeView: "dashboard",
  selectedId: "",
};

const viewSlice = createSlice({
  name: "view",
  initialState: initialViewState,
  reducers: {
    setActiveView: (state, action: PayloadAction<string>) => {
      state.activeView = action.payload;
    },
    setSelectedId: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload;
    },
  },
});

export const { setActiveView, setSelectedId } = viewSlice.actions;

export const selectActiveView = (state: RootState) => state.view.activeView;
export const selectSelectedId = (state: RootState) => state.view.selectedId;

export const viewReducer = viewSlice.reducer;
