import { Model, Schema, model, Types } from 'mongoose';

export interface IFile {
    id : Types.ObjectId;
    name: string;
    createdAt: Date;
    space: Types.ObjectId;
    location: string;
    chunks: [{
        number: number;
        id: string;
    }];
    size: number;
};

interface FileModel extends Model<IFile> {
    
};

const fileSchema = new Schema<IFile, FileModel>({
    name: {
        type: String,
        required: [true, "Please enter a name"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    space: {
        type: Types.ObjectId,
        ref: "space",
    },
    location: {
        type: String,
        required: [true, "Please enter a location"],
    },
    chunks: {
        type: [{
            id: String,
            number: Number,
        }],
    },
    size: {
        type: Number,
        required: [true, "Please enter a size"],
    },
});

const File = model<IFile, FileModel>('file', fileSchema);
export default File;