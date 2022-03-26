import User, { IPopulatedUser } from '../../models/User';

async function getEncSpaces(id: string) {
    try {
        const user: IPopulatedUser | null = await User.findById(id)
            .populate('invitedTo.userId')
            .populate('invitedTo.spaceId')
            .populate('spaces.spaceId')
            .populate('spaces');

        if (!user) return { err: 'User not found' };

        const { invitedTo, ...rest } = user;
        const invites = invitedTo.map((invite) => {
            const { user, space } = invite;
            return { user, space };
        });

        return { user: { ...rest, invitedTo: invites } };
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);

        return { err: message };
    }
}

export default getEncSpaces;
