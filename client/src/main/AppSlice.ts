import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';
import { RootState } from '../app/store';
import { ISpace } from '../features/spaces/spacesSlice';

interface IBaseUser {
    _id: string;
    email: string;
    password: string;
    verified: boolean;
    createdAt: Date;
    pub: JsonWebKey;
    priv: string;
}

export interface IUser extends IBaseUser {
    spaces: string;
    shared: {
        spaceId: string;
        pass: string;
    }[];
    invitedTo: {
        userId: string;
        spaceId: string;
        encPass?: string;
    }[];
}

export interface IPopulatedUser extends IBaseUser {
    spaces: ISpace[];
    shared: {
        space: ISpace;
        pass: string;
    }[];
    invitedTo: {
        user: IUser;
        space: ISpace;
        encPass?: string;
    }[];
}

export interface IInvitedTo {
    user: IUser;
    space: ISpace;
    encPass?: string | undefined;
}

export interface IShared {
    space: ISpace;
    pass: string;
}

export interface AppState {
    socket: null | {};
    userId: string;
    spaces: ISpace[];
    shareds: IShared[];
    priv: string;
    invitedTo: IInvitedTo[];
}

const initialState: AppState = {
    socket: null,
    userId: '',
    spaces: [],
    shareds: [],
    priv: '',
    invitedTo: [],
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
        setGlobalPriv: (state, action: PayloadAction<string>) => {
            state.priv = action.payload;
        },
        setGlobalInvitedTo: (state, action: PayloadAction<IInvitedTo[]>) => {
            state.invitedTo = action.payload;
        }
    },
});

export const {
    setGlobalSocketID,
    setGlobalUserId,
    setGlobalSpaces,
    setGlobalShareds,
    setGlobalPriv,
    setGlobalInvitedTo,
} = appSlice.actions;

export const selectSocket = (state: RootState) => state.app.socket;
export const selectUserId = (state: RootState) => state.app.userId;
export const selectSpaces = (state: RootState) => state.app.spaces;
export const selectShareds = (state: RootState) => state.app.shareds;
export const selectPriv = (state: RootState) => state.app.priv;
export const selectInvitedTo = (state: RootState) => state.app.invitedTo;

export default appSlice.reducer;
