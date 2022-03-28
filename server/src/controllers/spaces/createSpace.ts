import Space from '../../models/Space';
import User from '../../models/User';

export interface ICreateSpace {
    name: string;
    location: string;
    userId: string;
    parentLoc: string;
    personal: boolean;
    pass: string;
    baseSpace: string | undefined;
}

async function createSpace({
    name,
    location,
    userId,
    parentLoc,
    personal,
    pass,
    baseSpace,
}: ICreateSpace): Promise<string> {
    try {
        const space = await Space.create({
            name,
            location,
            user: userId,
            personal,
            ...(!personal && { pass }),
        });

        if (!space) return 'Space not created';
        const isBaseSpace = baseSpace ? false : true;

        if (!isBaseSpace) {
            const parentSpace = await Space.findOneAndUpdate(
                { user: userId, location: parentLoc },
                {
                    $push: {
                        'entities.subspaces': space.id,
                    },
                },
                { new: true }
            );

            if (!parentSpace) return 'Space not created';
        } else {
            const user = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        spaces: space.id,
                    },
                },
                { new: true }
            );

            if (!user) return 'Space not created';
        }

        return space.id.toString();
    } catch (err) {
        const { message } = err as Error;

        console.log('New error:', message);
        return message;
    }
}

export default createSpace;
