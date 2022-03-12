import File, { IFile } from '../../models/File';

const getFiles = async (fileIds: string[]) => {
    const files = await File.find({ _id: { $in: fileIds } });
    if (!files) console.log('No files found');

    return files as unknown as IFile[];
};

export default getFiles;
