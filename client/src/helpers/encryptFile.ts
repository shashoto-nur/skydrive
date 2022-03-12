import getFileChunk from '../utils/getFileChunk';
import shouldRepeat from '../utils/shouldRepeat';

import variables from '../env/variables';
import { IEncInit, IEncNUpload } from './interfaces';

const encryptChunkNUpload = async ({
    key,
    algorithm,
    file,
    start,
    end,
    chunkNumber,
    id,
    socket,
    chunkArray,
}: IEncNUpload) => {
    try {
        const unencryptedChunk = await getFileChunk(file, start, end);
        if (typeof unencryptedChunk === 'string')
            return console.log(unencryptedChunk);

        const encryptedData = await window.crypto.subtle.encrypt(
            algorithm,
            key,
            unencryptedChunk
        );

        const encryptedChunk = new Uint8Array(encryptedData);
        const fileSize = file.size + 1;
        let [repeat, newStart, newEnd] = shouldRepeat(fileSize, end);

        socket.emit(
            'store_chunk',
            {
                chunk: encryptedChunk,
                number: chunkNumber,
                id,
                repeat,
                chunkArray,
            },
            async (res: { chunk: [[number]]; err: string }) => {
                if (res.err) return console.log(res.err);
                const chunkArray = res.chunk;
                if (!repeat) {
                    const missingIndex = chunkArray.indexOf(undefined as any);
                    if (missingIndex === -1)
                        return console.log('File uploaded successfully');
                    [repeat, newStart, newEnd] = shouldRepeat(
                        fileSize,
                        variables.CHUNK_SIZE * missingIndex
                    );
                }

                encryptChunkNUpload({
                    key,
                    algorithm,
                    file,
                    start: newStart as number,
                    end: newEnd as number,
                    chunkNumber: chunkNumber + 1,
                    id,
                    socket,
                    chunkArray,
                });
            }
        );
    } catch ({ message }) {
        console.log(message as string);
    }
};

const encryptFile = async ({ file, key, algorithm, id, socket, start }: IEncInit) => {
    try {
        if (!key) return 'No key';
        if (!algorithm) return 'No algorithm';

        const end = start + variables.CHUNK_SIZE;
        encryptChunkNUpload({
            key,
            algorithm,
            file,
            start,
            end,
            chunkNumber: 0,
            id,
            socket,
            chunkArray: [[0]],
        });
    } catch ({ message }) {
        console.log(message as string);
    }
};

export default encryptFile;
