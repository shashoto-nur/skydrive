import jwt from 'jsonwebtoken';
import User from '../../models/User';


async function updatePassword(
    {password}: {password: string}
): Promise<{ msg: string, token: string, err: string}> {
    try {
        // const user = await User.login(email.toString(), password);
        console.log(`Password: ${ password }`);

        return { msg: `User logged in successfully`, token: "" , err: ""} 
    } catch(err) {
        const { message } = (err as Error);
        console.log('New error:', message);
        return { msg: `Password update failed`, token: '' , err: message };
    };
};

export default updatePassword;