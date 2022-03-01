export interface IFile {
    id : string;
    name: string;
    createdAt: Date;
    space: string;
    location: string;
    chunks: [{
        number: number;
        id: string;
    }];
    size: number;
};