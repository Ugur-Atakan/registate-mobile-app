import { configureStore } from '@reduxjs/toolkit';
import userSlice  from './slices/userSlice';
import  companySlice  from './slices/companySlice';
import commonSlice from './slices/commonSlice';

export const store = configureStore({
  reducer: {
    common: commonSlice,
    user: userSlice,
    company: companySlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;