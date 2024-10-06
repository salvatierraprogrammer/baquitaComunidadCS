import { configureStore } from "@reduxjs/toolkit";
import { ecApi } from "../service/ecApi"; // Ensure this path is correct
import authSlice from "./slice/authSlice"; // Ensure this path is correct

export const store = configureStore({
  reducer: {
    [ecApi.reducerPath]: ecApi.reducer,
    auth: authSlice, // Changed to 'auth' for clarity
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ecApi.middleware),
});