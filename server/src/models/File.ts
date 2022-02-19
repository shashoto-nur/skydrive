import { Model, Schema, model, Types } from 'mongoose';

export interface IFile {
    id : Types.ObjectId;
    name: string;
    createdAt: Date;
    location: string;
    chunks: string[];
    size: number;
};

interface FileModel extends Model<IFile> {
    
};

const fileSchema = new Schema<IFile, FileModel>({
    name: {
        type: String,
        required: [true, 'Please enter a name']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String,
        required: [true, 'Please enter a location']
    },
    chunks: {
        type: [String]
    },
    size : {
        type: Number,
        required: [true, 'Please enter a size']
    }
});

const File = model<IFile, FileModel>('file', fileSchema);
export default File;