import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface ISpace {
    _id : string;
    name: string;
    preferences: string[];
    bookmarks: string[];
    entities: {
        files: string[];
        folders: string[];
    };
};

export interface SpacesState {
  spaces: string[];
}

const initialState: SpacesState = {
  spaces: ['']
};

export const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    setGlobalSpaces: (state, action: PayloadAction<string[]>) => {
      const socket = action.payload;
      state.spaces = socket;
    },
  },
});

export const { setGlobalSpaces } = spacesSlice.actions;
export const selectSpaces = (state: RootState) => state.spaces.spaces;

export default spacesSlice.reducer;