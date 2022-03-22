import User from '../../models/User';

const storeKeyPair = async ({
    id,
    pub,
    priv,
}: {
    id: string;
    pub: JsonWebKey;
    priv: string;
}) => {
    const user = await User.findByIdAndUpdate(id, { pub, priv });
    if (!user) return 'User not found';

    return;
};

export default storeKeyPair;
