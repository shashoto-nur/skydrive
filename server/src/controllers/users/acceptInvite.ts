import User from '../../models/User';

const acceptInvite = async ({
    userId,
    spaceId,
}: {
    userId: string;
    spaceId: string;
}): Promise<{
    err?: string;
    encPass?: string;
}> => {
    try {
        const user = await User.findById(userId);
        if (!user) return { err: 'User not found' };

        const { invitedTo } = user;
        const invite = invitedTo.find(
            ({ spaceId: sId }) => sId.toString() === spaceId
        );
        if (!invite) return { err: 'Invite not found' };

        const { encPass } = invite;
        user.invitedTo = user.invitedTo.filter(
            ({ spaceId: sId }) => sId.toString() !== spaceId
        );
        await user.save();

        return { encPass };
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);
        return { err: message };
    }
};

export default acceptInvite;
