import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './app/store';
import { Socket } from "socket.io-client";

export interface AppState {
  socket: null | {};
}

const initialState: AppState = {
  socket: null
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setGlobalSocketID: (state, action: PayloadAction<Socket>) => {
      const socket = action.payload;
      state.socket = socket;
    }
  },
});

export const { setGlobalSocketID } = appSlice.actions;
export const selectSocket = (state: RootState) => state.app.socket;

export default appSlice.reducer;