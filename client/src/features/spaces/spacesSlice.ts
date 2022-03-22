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
        subspaces: string[];
    };
    personal: boolean;
    key: CryptoKey | undefined;
    algorithm:
        | {
              name: string;
              iv: Uint8Array;
          }
        | undefined;
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
    personal: boolean;
    key: CryptoKey | undefined;
    algorithm:
        | {
              name: string;
              iv: Uint8Array;
          }
        | undefined;
}
