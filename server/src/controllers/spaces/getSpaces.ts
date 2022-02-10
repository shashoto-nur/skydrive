import User from '../../models/User';

async function getSpaces(
    id: string
): Promise<string> {
    try {
        const spaces = await User.getSpaces(id);
        console.log(`Getting spaces: ${ spaces }`);

        return spaces;
    } catch(err) {
        const { message } = (err as Error);
        console.log('New error:', message);
        return message;
    };
};

export default getSpaces;