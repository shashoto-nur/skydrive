import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import User from '../../models/User';
const client = new OAuth2Client(process.env.CLIENT_ID);

interface ResObj {
    msg: string,
    token: string,
    err: string,
    id: string
}

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

async function oauthLoginUser(
    { oauthToken }: { oauthToken: string }
): Promise<{ msg: string, token: string, err: string, id: string }> {
    try {
        const ticket = await client.verifyIdToken({
            idToken: oauthToken,
            audience: process.env.CLIENT_ID
        });
        const tokenPayload = ticket.getPayload();
        if(!tokenPayload) return { msg: `Login failed`, token: '' , err: 'Invalid token', id:"" };

        const email = tokenPayload?.email;
        if(!email) return { msg: `Login failed`, token: '' , err: 'No email found', id:"" };

        const user = await User.findOne({ email });
        const id = (user!._id).toString();
        const token = createToken(id);  

        return { msg: `User logged in successfully`, token , err: "", id };
        
    } catch(err) {
        const { message } = (err as Error);
        console.log('New error:', message);
        return { msg: `Login failed`, token: '' , err: message, id:'' };
    };
};

export {loginUser, oauthLoginUser};