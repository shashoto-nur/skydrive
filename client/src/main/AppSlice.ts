import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";
import { RootState } from "../app/store";
import { ISpace } from "../features/spaces/spacesSlice";

export interface AppState {
    socket: null | {};
    userId: string;
    spaces: ISpace[];
}

const initialState: AppState = {
    socket: null,
    userId: "",
    spaces: [],
};

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setGlobalSocketID: (state, action: PayloadAction<Socket>) => {
            const socket = action.payload;
            state.socket = socket;
        },
        setGlobalUserId: (state, action: PayloadAction<string>) => {
            const userId = action.payload;
            state.userId = userId;
        },
        setGlobalSpaces: (state, action: PayloadAction<ISpace[]>) => {
            const spaces = action.payload;
            state.spaces = spaces;
        },
    },
});

export const { setGlobalSocketID, setGlobalUserId, setGlobalSpaces } =
    appSlice.actions;
export const selectSocket = (state: RootState) => state.app.socket;
export const selectUserId = (state: RootState) => state.app.userId;
export const selectSpaces = (state: RootState) => state.app.spaces;

export default appSlice.reducer;
