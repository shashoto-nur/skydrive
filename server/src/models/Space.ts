import { Schema, model, Types } from 'mongoose';

export interface ISpace {
    id: Types.ObjectId;
    name: string;
    user: Types.ObjectId;
    location: string;
    preferences: string[];
    bookmarks: string[];
    entities: {
        files: string[];
        subspaces: string[];
    };
    personal: boolean;
}

const spaceSchema = new Schema<ISpace>({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
    },
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'Please enter a user'],
    },
    location: {
        type: String,
        required: [true, 'Please enter a location'],
    },
    preferences: {
        type: [String],
    },
    bookmarks: {
        type: [String],
    },
    entities: {
        files: [
            {
                type: Types.ObjectId,
                ref: 'File',
            },
        ],
        subspaces: [
            {
                type: Types.ObjectId,
                ref: 'Space',
            },
        ],
    },
    personal: {
        type: Boolean,
        default: true,
        required: [true, 'Please enter a personal space'],
    },
});

spaceSchema.index({ user: 1, location: 1 }, { unique: true });

const Space = model<ISpace>('Space', spaceSchema);
export default Space;
