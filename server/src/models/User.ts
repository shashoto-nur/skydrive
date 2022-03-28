import * as validator from 'validator';
import bcrypt from 'bcrypt';
import { Model, Schema, model, Types } from 'mongoose';
import { ISpace } from './Space';

interface IBaseUser {
    _id: string;
    email: string;
    password: string;
    verified: boolean;
    createdAt: Date;
    pub: JsonWebKey;
    priv: string;
}

export interface IUser extends IBaseUser {
    spaces: Types.ObjectId[];
    shared: {
        spaceId: string;
        pass: string;
    }[];
    invitedTo: {
        userId: Types.ObjectId;
        spaceId: Types.ObjectId;
        encPass?: string;
    }[];
}

export interface IPopulatedUser extends IBaseUser {
    spaces: ISpace[];
    shared: {
        space: ISpace;
        pass: string;
    }[];
    invitedTo: {
        user: IUser;
        space: ISpace;
        encPass?: string;
    }[];
}

interface UserModel extends Model<IUser> {
    signup: (email: string, password: string) => IUser;
    login: (email: string, password: string) => IUser;
    updatePassword: (id: string, password: string) => IUser;
}

const userSchema = new Schema<IUser, UserModel>({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [validator.default.isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
    },
    verified: { type: Boolean, default: false },
    spaces: {
        type: [Types.ObjectId],
        ref: 'Space',
    },
    createdAt: { type: Date, default: Date.now },
    pub: { type: Object },
    priv: { type: String },
    shared: {
        type: [
            {
                spaceId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Space',
                },
                pass: String,
            },
        ],
    },
    invitedTo: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            spaceId: {
                type: Schema.Types.ObjectId,
                ref: 'Space',
            },
            encPass: { type: String },
        },
    ],
});

userSchema.static('signup', async function (email, password) {
    try {
        const hashedPassword = (await bcrypt.hash(password, 10)).toString();
        const user: IUser = await User.create({
            email,
            password: hashedPassword,
        });

        return user;
    } catch (error) {
        console.log('New error:', error);
    }
});

userSchema.static('login', async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw Error('Incorrect email');

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) throw Error('Password does not match');

    return user;
});

userSchema.static('updatePassword', async function (id, password) {
    const hashedPassword = (await bcrypt.hash(password, 10)).toString();
    const user = await User.findByIdAndUpdate(id, {
        password: hashedPassword,
        verified: true,
    });
    if (!user) throw Error('Invalid token');

    return user;
});

const User = model<IUser, UserModel>('User', userSchema);
export default User;
