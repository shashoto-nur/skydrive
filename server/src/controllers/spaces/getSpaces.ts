import Space, { ISpace } from '../../models/Space';

async function getSpaces(ids: string[]): Promise<string | ISpace[]> {
    try {
        const spaces = await Space.find({ _id: { $in: ids } });
        return spaces;
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);
        return message;
    }
}

export default getSpaces;
