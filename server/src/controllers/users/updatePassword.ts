import jwt from 'jsonwebtoken';
import User from '../../models/User';


async function updatePassword(
    {id, password}: {id: string , password: string}
): Promise<{ msg: string, token: string, err: string}> {
    try {
        const user = await User.updatePassword(id, password);
        console.log(user);

        return { msg: `Password changed successfully`, token: "" , err: ""} 
    } catch(err) {
        const { message } = (err as Error);
        console.log('New error:', message);
        return { msg: `Password update failed`, token: '' , err: message };
    };
};

export default updatePassword;