import File from '../../models/File';
import Space from '../../models/Space';
import { ISpace } from '../../models/Space';

const createFileObject = async({ name, size, space }: { name: string, size: number, space: string }): Promise<string> => {
    try {
        const file = await File.create({ name, size, location: space });

        if (!file) return "Error: Failed to create file";
        const fileId = file._id.toString();

        const spaceObj = await Space.findById(space);
        if (!spaceObj) return "Error: Space not found";

        (spaceObj as ISpace).entities.files.push(fileId);
        spaceObj.populate("entities.files");

        await spaceObj.save();
        console.log({ spaceObj });

        return fileId;
    } catch ({ message }) {
        console.log(message);
        return message as string;
    };
};

export default createFileObject;