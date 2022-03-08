import File, { IFile } from "../../models/File";

const getFile = async (fileId: string) => {
    const file = await File.findById(fileId);
    if(!file) return 'File not found';

    return file as unknown as IFile;
};

export default getFile;