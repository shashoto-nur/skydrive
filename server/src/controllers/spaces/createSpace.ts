import Space from '../../models/Space';

async function createSpace(
    name: string,
    location: string,
    baseSpace: string,
    parentLoc: string
): Promise<string> {
    try {
        const space = await Space.createSpace({ name, location, baseSpace });
        if (!space) return 'Space not created';

        if(!baseSpace) return space.id.toString();
        const baseSpaceObj = await Space.findOneAndUpdate(
            { baseSpace, location: parentLoc },
            {
                $push: {
                    'entities.subspaces': space.id,
                },
            },
            { new: true }
        );
        if (!baseSpaceObj) return 'Space not created';

        return space.id.toString();
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);
        return message;
    }
}

export default createSpace;
