// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; 
import toastReducer from "./uiSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    ui:toastReducer
   
  },
});
