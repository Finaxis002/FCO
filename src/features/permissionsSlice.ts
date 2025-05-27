import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Permissions {
  allCaseAccess: boolean;
  viewRights: boolean;
  createCaseRights: boolean;
  createUserRights: boolean;
  userRolesAndResponsibility: boolean;
  delete: boolean;
  edit: boolean;
  remarks: boolean; // ✅ separated
  chat: boolean; // ✅ separated
  canShare: boolean;
}

interface PermissionsState {
  edit: boolean;
  permissions: Permissions | null;
  loading: boolean;
  error: string | null;
}

// Async thunk to fetch permissions by user ID
export const fetchPermissions = createAsyncThunk<
  Permissions,
  string,
  { rejectValue: string }
>("permissions/fetchPermissions", async (userId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    if (!userId) return rejectWithValue("User ID not found");
    if (!token) return rejectWithValue("Auth token not found");

    const res = await axios.get(
      `https://fcobackend-23v7.onrender.com/api/users/${userId}/permissions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.data) return rejectWithValue("No user data found");

    // THIS IS THE KEY:
    // Return the nested permissions object from the user document
    return res.data.permissions;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch permissions");
  }
});

const initialState: PermissionsState = {
  permissions: null,
  loading: false,
  error: null,
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    resetPermissions: (state) => {
      state.permissions = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPermissions.fulfilled,
        (state, action: PayloadAction<Permissions>) => {
          state.loading = false;
          state.permissions = action.payload;
        }
      )
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch permissions";
        state.permissions = null;
      });
  },
});

export const { resetPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;
