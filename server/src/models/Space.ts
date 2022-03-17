import { Model, Schema, model, Types } from 'mongoose';

export interface ISpace {
    id: Types.ObjectId;
    name: string;
    location: string;
    preferences: string[];
    bookmarks: string[];
    entities: {
        files: string[];
        subspaces: string[];
    };
}

interface SpaceModel extends Model<ISpace> {
    createSpace: ({
        name,
        location,
    }: {
        name: string;
        location: string;
    }) => Promise<ISpace | undefined>;
    getSpaces: (ids: string[]) => Promise<ISpace[]>;
}

const spaceSchema = new Schema<ISpace, SpaceModel>({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
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
                ref: 'file',
            },
        ],
        subspaces: [
            {
                type: Types.ObjectId,
                ref: 'space',
            },
        ],
    },
});

spaceSchema.static('createSpace', async function ({ name, location }) {
    try {
        const space: ISpace = await Space.create({ name, location });
        return space;
    } catch (error) {
        console.log('New error:', error);
    }
});

spaceSchema.static('getSpaces', async function (ids) {
    const spaces = await Space.find({ _id: { $in: ids } });
    return spaces;
});

const Space = model<ISpace, SpaceModel>('space', spaceSchema);
export default Space;
