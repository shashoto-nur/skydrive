import Space, { ISpace } from '../../models/Space';

async function getSpace({
    location,
    userId,
}: {
    location: string;
    userId: string | undefined;
}): Promise<string | ISpace> {
    try {
        const space = await Space.findOne({ user: userId, location })
            .populate('entities.files')
            .populate('entities.subspaces');

        if (!space) return 'Error: Failed to find space';

        return space;
    } catch ({ message }) {
        console.log('New error:', message);
        return message as string;
    }
}

export default getSpace;
