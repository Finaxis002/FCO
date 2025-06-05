import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// Update the path below to the correct relative path where 'service.d.ts' or 'service.ts' is located
import type { Service } from "../types/service";

export const getServices = createAsyncThunk("service/getServices", async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get("https://tumbledrybe.sharda.co.in/api/cases", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const deleteService = createAsyncThunk("service/deleteService", async (id: string) => {
  const token = localStorage.getItem("token");
  await axios.delete(`https://tumbledrybe.sharda.co.in/api/services/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return id;
});

const serviceSlice = createSlice({
  name: "service",
  initialState: {
    services: [] as Service[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(getServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(getServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter((s) => s._id !== action.payload);
      });
  },
});

export default serviceSlice.reducer;