import User from '../../models/User';

const inviteUser = async ({
    userId,
    spaceId,
    otheruser,
    encKey,
    encAlgo,
}: {
    userId: string;
    spaceId: string;
    otheruser: string;
    encKey: string;
    encAlgo: string;
}) => {
    const invitedTo = { userId, spaceId, encKey, encAlgo };
    const otherUser = await User.findByIdAndUpdate(
        otheruser,
        {
            $push: { invitedTo },
        },
        { new: true }
    );

    if (!otherUser) return 'User not found';
    return '';
};

export default inviteUser;
