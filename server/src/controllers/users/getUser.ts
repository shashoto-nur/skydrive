import User, { IPopulatedUser } from '../../models/User';
import getKeys from './getKeys';

async function getEncSpaces(id: string) {
    try {
        const user = await User.findById(id)
            .populate('invitedTo.userId')
            .populate('invitedTo.spaceId');

        if (!user) return { err: 'User not found' };

        const encSpaces = user.spaces;
        const { invitedTo } = user;
        const encShared = user.sharedSpaces;

        const invites = await Promise.all(
            invitedTo.map(async ({ encPass, ...rest }) => {
                const otheruser = rest.userId.toString();
                const { pub, priv } = await getKeys({ userId: id, otheruser });

                return { ...rest, priv, pub };
            })
        );

        return { encSpaces, encShared, invites };
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);
        return { err: message };
    }
}

export default getEncSpaces;
