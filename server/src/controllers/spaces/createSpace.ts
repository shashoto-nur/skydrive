import Space from '../../models/Space';

async function createSpace(name: string): Promise<string> {
    try {
        const space: any = await Space.createSpace(name);
        return `${space.id}`;
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);
        return message;
    }
}

export default createSpace;
