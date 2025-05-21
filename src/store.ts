import { configureStore } from '@reduxjs/toolkit';
import caseReducer from './features/caseSlice';
import userReducer from './features/userSlice';
import permissionsReducer from "./features/permissionsSlice";


export const store = configureStore({
  reducer: {
    case: caseReducer,
    users: userReducer,
    permissions: permissionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;