import File from '../../models/File';
import Space from '../../models/Space';

const createFileObject = async({ name, size, space }: { name: string, size: number, space: string }) => {
    const file = new File({ name, size, location: space });
    const createdFile = await file.save();

    if(!createdFile) return 'Error: Failed to create file';
    const fileId = createdFile._id.toString();

    const spaceObj = await Space.findByIdAndUpdate(space, {
        $push: {
            files: {
                $each: [{ id: fileId }],
            }
        }
    });

    if(!spaceObj) return 'Error: Space not found';

    return fileId;
};

export default createFileObject;