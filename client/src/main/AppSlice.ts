import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';
import { RootState } from '../app/store';
import { ISpace } from '../features/spaces/spacesSlice';

export interface IBaseUser {
    _id: string;
    email: string;
    password: string;
    verified: boolean;
    spaces: string;
    createdAt: Date;
    pub: JsonWebKey;
    priv: string;
}

export interface IUser extends IBaseUser {
    invitedTo: {
        priv: string;
        pub: string | JsonWebKey;
        userId: string;
        spaceId: string;
    }[];
}

export interface IPopulatedUser extends IBaseUser {
    invitedTo: IInvitedTo[];
}
export interface IInvitedTo {
    priv: string;
    pub: string | JsonWebKey;
    user: IUser;
    space: ISpace;
}

export interface IShared {
    pass: string;
    spaceId: string;
}

export interface AppState {
    socket: null | {};
    userId: string;
    spaces: ISpace[];
    shareds: IShared[];
}

const initialState: AppState = {
    socket: null,
    userId: '',
    spaces: [],
    shareds: [],
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
        },
        setGlobalSpaces: (state, action: PayloadAction<ISpace[]>) => {
            const spaces = action.payload;
            state.spaces = spaces;
        },
        setGlobalShareds: (state, action: PayloadAction<IShared[]>) => {
            const shareds = action.payload;
            state.shareds = shareds;
        },
    },
});

export const {
    setGlobalSocketID,
    setGlobalUserId,
    setGlobalSpaces,
    setGlobalShareds,
} = appSlice.actions;
export const selectSocket = (state: RootState) => state.app.socket;
export const selectUserId = (state: RootState) => state.app.userId;
export const selectSpaces = (state: RootState) => state.app.spaces;
export const selectShareds = (state: RootState) => state.app.shareds;

export default appSlice.reducer;
