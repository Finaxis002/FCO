import { configureStore } from '@reduxjs/toolkit';
import caseReducer from './features/caseSlice';
import userReducer from './features/userSlice'

export const store = configureStore({
  reducer: {
    case: caseReducer,
    users: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;