import jwt from 'jsonwebtoken';
import User from '../../models/User';

const createToken = (id: string) => {
    const token = jwt.sign(
        { id },
        process.env.SECRET_KEY!,
        { expiresIn: +(process.env.TOKEN_MAX_AGE!) }
    );
    return token;
};

async function loginUser(
    {email, password}: {email: string, password: string}
): Promise<{ msg: string, token: string, err: string}> {
    try {
        const user = await User.login(email.toString(), password);
        console.log(`User login: ${ user._id }`);
        const token = createToken(user._id);

        return { msg: `User logged in successfully`, token , err: ""} 
    } catch(err) {
        const { message } = (err as Error);
        console.log('New error:', message);
        return { msg: `Login failed`, token: '' , err: message };
    };
};

export default loginUser;