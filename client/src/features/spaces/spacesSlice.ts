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