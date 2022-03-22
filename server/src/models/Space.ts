import { Model, Schema, model, Types } from 'mongoose';

export interface ISpace {
    id: Types.ObjectId;
    name: string;
    baseSpace: Types.ObjectId;
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

interface SpaceModel extends Model<ISpace> {
    createSpace: ({
        name,
        location,
        baseSpace,
        personal,
    }: {
        name: string;
        location: string;
        baseSpace: string;
        personal: boolean;
    }) => Promise<ISpace | undefined>;
    getSpaces: (ids: string[]) => Promise<ISpace[]>;
}

const spaceSchema = new Schema<ISpace, SpaceModel>({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
    },
    baseSpace: {
        type: Schema.Types.ObjectId,
        ref: 'Space',
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
    personal: {
        type: Boolean,
        default: true,
        required: [true, 'Please enter a personal space'],
    },
    key: {
        type: CryptoKey,
    },
    algorithm: {
        type: {
            name: String,
            iv: Uint8Array,
        },
    },
});

spaceSchema.index({ baseSpace: 1, location: 1 }, { unique: true });

spaceSchema.static(
    'createSpace',
    async function ({ name, location, baseSpace, personal }) {
        try {
            if (baseSpace)
                return await Space.create({
                    name,
                    location,
                    baseSpace,
                    personal,
                });

            return await Space.create({
                name,
                location,
                personal,
            });
        } catch (error) {
            console.log('New error:', error);
        }
    }
);

spaceSchema.static('getSpaces', async function (ids) {
    const spaces = await Space.find({ _id: { $in: ids } });
    return spaces;
});

const Space = model<ISpace, SpaceModel>('space', spaceSchema);
export default Space;
