import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { IPopulatedSpace } from '../spaces/spacesSlice';

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
    spaceInView: IPopulatedSpace | null;
}

const initialState: ViewState = {
    incompleteFiles: [],
    spaceInView: null,
};

export const viewSlice = createSlice({
    name: 'view',
    initialState,
    reducers: {
        setGlobalIncompleteFiles: (state, action: PayloadAction<IFile[]>) => {
            const files = action.payload;
            state.incompleteFiles = files;
        },
        setSpaceInView: (state, action: PayloadAction<IPopulatedSpace>) => {
            const space = action.payload;
            state.spaceInView = space;
        },
    },
});

export const { setGlobalIncompleteFiles, setSpaceInView } = viewSlice.actions;
export const selectIncomFiles = (state: RootState) =>
    state.view.incompleteFiles;
export const selectSpaceInView = (state: RootState) => state.view.spaceInView;

export default viewSlice.reducer;
