import { Model, Schema, model, Types } from 'mongoose';

export interface ISpace {
    id : Types.ObjectId;
    name: string;
    preferences: string[];
    bookmarks: string[];
    entities: {
        files: string[];
        folders: string[];
    };
};

interface SpaceModel extends Model<ISpace> {
    createSpace: (name: string) => ISpace;
    getSpaces: (ids: string[]) => ISpace[];
};

const spaceSchema = new Schema<ISpace, SpaceModel>({
    name: {
        type: String,
        required: [true, 'Please enter a name']
    },
    preferences: {
        type: [String]
    },
    bookmarks: {
        type: [String]
    },
    entities: {
        files: [{
            type: Types.ObjectId,
            ref: 'file'
        }],
        folders: [{
            type: Types.ObjectId,
            ref: 'folder'
        }]
    }
});

spaceSchema.static('createSpace', async function(name) {
    try {
        const space: ISpace = await Space.create({ name });
        return space;
    } catch (error) {
        console.log('New error:', error);
    };
});

spaceSchema.static('getSpaces', async function(ids) {
    const spaces = await Space.find({ '_id': { $in: ids } });
    return spaces;
});

const Space = model<ISpace, SpaceModel>('space', spaceSchema);
export default Space;