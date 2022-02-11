import { Model, Schema, model, Types } from 'mongoose';

export interface ISpace {
    id : Types.ObjectId;
    name: string;
    preferences: string[];
    bookmarks: string[];
};

interface UserModel extends Model<ISpace> {
    createSpace: (name: string) => ISpace;
    getSpaces: (ids: string[]) => ISpace[];
};

const spaceSchema = new Schema<ISpace, UserModel>({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        unique: true,
    },
    preferences: {
        type: [String]
    },
    bookmarks: {
        type: [String]
    }
});

spaceSchema.static('createSpace', async function(name) {
    try {
        const space: ISpace = await this.create({ name });
        return space;
    } catch (error) {
        console.log('New error:', error);
    };
});

spaceSchema.static('getSpaces', async function(ids) {
    const spaces = await this.find({ '_id': { $in: ids } });
    return spaces;
});

const Space = model<ISpace, UserModel>('space', spaceSchema);
export default Space;