import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface LoginState {
    key: CryptoKey | null;
    algorithm: { name: string; iv: Uint8Array } | null;
}

const initialState: LoginState = {
    key: null,
    algorithm: null,
};

export const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        setGlobalKey: (state, action: PayloadAction<CryptoKey>) => {
            const key = action.payload;
            state.key = key;
        },
        setGlobalAlgorithm: (
            state,
            action: PayloadAction<{ name: string; iv: Uint8Array }>
        ) => {
            const algorithm = action.payload;
            state.algorithm = algorithm;
        },
    },
});

export const { setGlobalKey, setGlobalAlgorithm } = loginSlice.actions;
export const selectKey = (state: RootState) => state.login.key;
export const selectAlgorithm = (state: RootState) => state.login.algorithm;

export default loginSlice.reducer;
