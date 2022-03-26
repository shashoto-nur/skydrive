import User from '../../models/User';

const addSharedSpace = async (
    shared: {
        pass: string;
        spaceId: string;
    },
    userId: string
): Promise<string> => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    shared: shared,
                },
            },
            { new: true }
        );

        if (!user) return 'User not found';
        return 'Shared space added';
    } catch (err) {
        const { message } = err as Error;

        console.log('New error:', message);
        return message;
    }
};

export default addSharedSpace;
