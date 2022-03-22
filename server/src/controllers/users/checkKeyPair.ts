import User from '../../models/User';

const checkKeyPair = async ({ id }: { id: string }) => {
    const user = await User.findById(id);
    if (!user) return { exists: false, err: 'User not found' };

    const { pub, priv } = user;
    if (!pub || !priv)
        return { exists: false, err: 'User does not have key pair' };

    return { exists: true, err: '' };
};

export default checkKeyPair;
