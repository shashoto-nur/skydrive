import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface LoginState {
  password: string;
  key: CryptoKey | null;
  algorithm: { name: string, iv: Uint8Array } | null;
}

const initialState: LoginState = {
  password: '',
  key: null,
  algorithm: null
};

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setGlobalPassword: (state, action: PayloadAction<string>) => {
      const password = action.payload;
      state.password = password;
    },
    setGlobalKey: (state, action: PayloadAction<CryptoKey>) => {
      const key = action.payload;
      state.key = key;
    },
    setGlobalAlgorithm: (state, action: PayloadAction<{ name: string, iv: Uint8Array }>) => {
      const algorithm = action.payload;
      state.algorithm = algorithm;
    },
  },
});

export const { setGlobalPassword, setGlobalKey, setGlobalAlgorithm } = loginSlice.actions;
export const selectPassword = (state: RootState) => state.login.password;
export const selectKey = (state: RootState) => state.login.key;
export const selectAlgorithm = (state: RootState) => state.login.algorithm;

export default loginSlice.reducer;