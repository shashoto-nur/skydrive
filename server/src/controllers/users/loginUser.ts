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
): Promise<{ msg: string, token: string, err: string, id: string }> {
    try {
        const id = (await User.login(email.toString(), password))._id;
        const token = createToken(id);
        const res = { msg: `User logged in successfully`, token , err: "", id };

        return res;
    } catch(err) {
        const { message } = (err as Error);
        console.log('New error:', message);
        return { msg: `Login failed`, token: '' , err: message, id:"" };
    };
};

export default loginUser;