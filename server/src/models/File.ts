import { Model, Schema, model, Types } from 'mongoose';

export interface IFile {
    id: Types.ObjectId;
    name: string;
    createdAt: Date;
    space: Types.ObjectId;
    location: string;
    chunks: [[number]];
    chunkNum: number;
    size: number;
}

interface FileModel extends Model<IFile> {}

const fileSchema = new Schema<IFile, FileModel>({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    space: {
        type: Types.ObjectId,
        ref: 'Space',
    },
    location: {
        type: String,
        required: [true, 'Please enter a location'],
    },
    chunks: {
        type: [[Number]],
    },
    chunkNum: {
        type: Number,
        default: 0,
    },
    size: {
        type: Number,
        required: [true, 'Please enter a size'],
    },
});

const File = model<IFile, FileModel>('File', fileSchema);
export default File;
