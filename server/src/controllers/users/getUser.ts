import User, { IPopulatedUser } from '../../models/User';

async function getEncSpaces(id: string) {
    try {
        const user = await User.findById(id)
            .populate('invitedTo.userId')
            .populate('invitedTo.spaceId');

        if (!user) return { user: null, err: 'User not found' };
        return { user, err: null };
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);
        return { user: null, err: message };
    }
}

export default getEncSpaces;
