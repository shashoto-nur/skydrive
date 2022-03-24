import User from '../../models/User';

const inviteUser = async ({
    userId,
    spaceId,
    otheruser,
    encPass,
}: {
    userId: string;
    spaceId: string;
    otheruser: string;
    encPass: string;
}) => {
    const invitedTo = { userId, spaceId, encPass };
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
