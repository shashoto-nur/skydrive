import { createSpace, getSpaces } from '../controllers/spaces/';
import {
    createFileObject,
    getFile,
    getFiles,
    downloadChunk,
    storeChunk,
} from '../controllers/files/';
import { ISpace } from '../models/Space';
import { IFile } from '../models/File';
import { Socket } from 'socket.io';

const setSpacesEvents = (socket: Socket) => {
    socket.on(
        'create_space',
        async (
            { space }: { space: string },
            callback: (arg0: { spaceIds?: any; res?: string }) => void
        ) => {
            if (socket.handshake.auth.userId) {
                const newSpaceIds = await createSpace(space);

                socket.handshake.auth.spaceIds = socket.handshake.auth.spaceIds
                    ? [...socket.handshake.auth.spaceIds, newSpaceIds].filter(
                          (el) => el !== ''
                      )
                    : [newSpaceIds];
                callback({ spaceIds: socket.handshake.auth.spaceIds });
            } else callback({ res: 'Unauthorized' });
        }
    );

    socket.on(
        'get_spaces',
        async (
            ids: string[],
            callback: (arg0: { res: string | ISpace[] }) => void
        ) => {
            if (socket.handshake.auth.userId) {
                socket.handshake.auth.spaceIds = ids;
                const res = await getSpaces(ids);
                callback({ res });
            } else callback({ res: 'Unauthorized' });
        }
    );

    socket.on(
        'upload_file',
        async (
            fileData: { name: string; size: number; space: string },
            callback: (arg0: { id: any }) => void
        ) => {
            const id: string = await createFileObject(fileData);
            callback({ id });
        }
    );

    socket.on(
        'get_files',
        async (
            fileIds: string[],
            callback: (arg0: { files: IFile[] }) => void
        ) => {
            const files = await getFiles(fileIds);
            callback({ files });
        }
    );

    socket.on(
        'get_file',
        async (
            fileId: string,
            callback: (arg0: { file: IFile | string }) => void
        ) => {
            const file = await getFile(fileId);
            callback({ file });
        }
    );

    socket.on(
        'store_chunk',
        async (
            {
                chunk,
                number,
                id,
                repeat,
                chunkArray,
            }: {
                chunk: Buffer;
                number: number;
                id: string;
                repeat: boolean;
                chunkArray: [[number]];
            },
            callback: (arg0: any) => void
        ) => {
            let file = socket.handshake.auth.files.find(
                (file: { id: string; uploading: number[] }) => {
                    if (file.id === id) {
                        file.uploading = [...file.uploading, number];
                        return file;
                    }
                }
            );
            if (!file) {
                file = {
                    id,
                    uploading: [number],
                };
                socket.handshake.auth.files.push(file);
            }

            const res = await storeChunk({
                chunk,
                number,
                id,
                repeat,
                chunkArray,
            });

            file.uploading = file.uploading.filter(
                (item: number) => item !== number
            );

            socket.handshake.auth.files = socket.handshake.auth.files.map(
                (sockFile: { id: string }) => {
                    if (sockFile.id === id) return file;
                    return sockFile;
                }
            );

            const returnData =
                typeof res === 'string'
                    ? { chunk: [[0]], err: res }
                    : { chunk: res, err: '' };
            callback(returnData);
        }
    );

    socket.on(
        'get_uploading_chunks',
        (id: string, callback: (arg0: { uploading: number[] }) => void) => {
            const { uploading } = socket.handshake.auth.files.filter(
                (file: { id: string; uploading: [number] }) => file.id === id
            );
            callback({ uploading });
        }
    );

    socket.on('upload_end', (id: string) => {
        socket.handshake.auth.files = socket.handshake.auth.files.filter(
            (file: { id: string; uploading: [number] }) => file.id !== id
        );
    });

    socket.on(
        'get_chunk',
        async (
            { fileNums, number }: { fileNums: [number]; number: number },
            callback: (arg0: { status: string }) => void
        ) => {
            await downloadChunk({ fileNums, number, socket, callback });
        }
    );
};

export default setSpacesEvents;
