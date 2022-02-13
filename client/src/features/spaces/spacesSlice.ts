import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface ISpace {
  _id : string;
  name: string;
  preferences: string[];
  bookmarks: string[];
};

export interface SpacesState {
  spaces: ISpace[] | [''];
}

const initialState: SpacesState = {
  spaces: ['']
};

export const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    setGlobalSpaces: (state, action: PayloadAction<ISpace[]>) => {
      const socket = action.payload;
      state.spaces = socket;
    },
  },
});

export const { setGlobalSpaces } = spacesSlice.actions;
export const selectSpaces = (state: RootState) => state.spaces.spaces;

export default spacesSlice.reducer;