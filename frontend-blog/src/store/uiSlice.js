// src/store/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    toast: { severity: null, summary: "", detail: "", key: 0 },
  },
  reducers: {
    showToast: (state, action) => {
      // severity: 'success', 'info', 'warn', 'error'
      state.toast = {
        ...action.payload,
        key: Date.now(), // Unique key to trigger useEffect
      };
    },
  },
});

export const { showToast } = uiSlice.actions;
export default uiSlice.reducer;
