
import * as validator from 'validator';
import bcrypt from 'bcrypt';
import { Model, Schema, model } from 'mongoose';

interface IUser {
    email: string;
    password: string;
}

interface UserModel extends Model<IUser> {
    signup: (email: string, password: string) => any;
    login: (email: string, password: string) => any;
}

const userSchema = new Schema<IUser, UserModel>({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [validator.default.isEmail, 'Please enter a valid email'],
        verified: { type: Boolean, default: false }
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [8, 'Minimum password length is 8 characters'],
        changed: { type: Boolean, default: false }
    }
});

userSchema.static('login', async function(email, password) {
    const user = await this.findOne({ email });

    if (!user) throw Error('Incorrect email');

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) throw Error('Password does not match');

    return user;
});

userSchema.static('signup', async function(email, password) {
    try {
        const hashedPassword = (await bcrypt.hash(password, 10)).toString();
        const user: IUser = await User.create({ email, password: hashedPassword });

        return user;
    } catch (error) {
        console.log('New error:', error);
    };
});


const User = model<IUser, UserModel>('user', userSchema);
export default User;