import User from '../../models/User';

async function getEncSpaces(id: string): Promise<string> {
    try {
        const user = await User.findById(id);
        return user!.spaces;
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);
        return message;
    }
}

export default getEncSpaces;
