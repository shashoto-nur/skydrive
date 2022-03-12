import File from '../../models/File';
import Space from '../../models/Space';

interface IFileInit {
    name: string;
    size: number;
    space: string;
}

const createFileObject = async ({ name, size, space }: IFileInit) => {
    try {
        const file = await File.create({ name, size, location: space });
        if (!file) return 'Error: Failed to create file';

        const fileId = file._id.toString();
        const updatedSpace = await Space.findByIdAndUpdate(
            space,
            {
                $push: {
                    'entities.files': fileId,
                },
            },
            { new: true }
        );

        if (!updatedSpace) return 'Error: Failed to update space';
        return fileId;
    } catch ({ message }) {
        console.log({ message });
        return message as string;
    }
};

export default createFileObject;
