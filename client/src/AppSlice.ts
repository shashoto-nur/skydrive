import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './app/store';
import { Socket } from "socket.io-client";

export interface AppState {
  socket: null | {};
  userId: string
}

const initialState: AppState = {
  socket: null,
  userId: ''
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setGlobalSocketID: (state, action: PayloadAction<Socket>) => {
      const socket = action.payload;
      state.socket = socket;
    },
    setGlobalUserId: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.userId = userId;
    }
  },
});

export const { setGlobalSocketID, setGlobalUserId } = appSlice.actions;
export const selectSocket = (state: RootState) => state.app.socket;
export const selectUserId = (state: RootState) => state.app.userId;

export default appSlice.reducer;