import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface IFile {
    _id: string;
    name: string;
    createdAt: Date;
    space: string;
    location: string;
    chunks: [[number]];
    chunkNum: number;
    size: number;
}

export interface ViewState {
    incompleteFiles: IFile[];
}

const initialState: ViewState = {
    incompleteFiles: [],
};

export const viewSlice = createSlice({
    name: 'view',
    initialState,
    reducers: {
        setGlobalIncompleteFiles: (state, action: PayloadAction<IFile[]>) => {
            const files = action.payload;
            state.incompleteFiles = files;
        },
    },
});

export const { setGlobalIncompleteFiles } = viewSlice.actions;
export const selectIncomFiles = (state: RootState) =>
    state.view.incompleteFiles;

export default viewSlice.reducer;
