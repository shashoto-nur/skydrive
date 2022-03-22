import User from '../../models/User';

const getKeys = async ({
    userId,
    otheruser,
}: {
    userId: string;
    otheruser: string;
}) => {
    const user = await User.findById(userId);
    if (!user) return { pub: '', priv: '' };

    const { priv } = user;

    const otherUser = await User.findById(otheruser);
    if (!otherUser) return { pub: '', priv: '' };

    const { pub } = otherUser;

    if (!pub || !priv) return { pub: '', priv: '' };
    return { pub, priv };
};

export default getKeys;
