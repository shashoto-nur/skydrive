import Space from '../../models/Space';

async function createSpace(
    name: string,
    location: string,
    baseSpace: string
): Promise<string> {
    try {
        const space = await Space.createSpace({ name, location, baseSpace });
        if (!space) return 'Space not created';
        return `Space created with id: ${space.id}`;
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);
        return message;
    }
}

export default createSpace;
