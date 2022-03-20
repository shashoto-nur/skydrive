import { IFile } from '../view/viewSlice';

export interface ISpace {
    _id: string;
    name: string;
    baseSpace: string;
    location: string;
    preferences: string[];
    bookmarks: string[];
    entities: {
        files: string[];
        folders: string[];
    };
}

export interface IPopulatedSpace {
    _id: string;
    name: string;
    location: string;
    preferences: string[];
    bookmarks: string[];
    entities: {
        files: IFile[];
        subspaces: ISpace[];
    };
}
