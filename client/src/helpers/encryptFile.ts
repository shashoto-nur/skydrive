import getFileChunk from '../utils/getFileChunk';
import shouldRepeat from '../utils/shouldRepeat';

import variables from '../env/variables';
import { IEncInit, IEncNUpload } from './interfaces';
import getAllIndexes from '../utils/getAllIndexes';

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
    recovery,
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
        if (recovery) repeat = false;

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
                const { chunk: chunkArray } = res;
                const missingIndexes = getAllIndexes(chunkArray, undefined);

                if (!repeat && missingIndexes.length === 0) {
                    socket.emit('upload_end', { id });
                    return console.log('File uploaded successfully');
                }

                if (!repeat) {
                    return socket.emit(
                        'get_uploading_chunks',
                        { id },
                        ({ uploading }: { uploading: [number] }) => {
                            let missingIndex;
                            for (let i = 0; i < missingIndexes.length; i++) {
                                if (!uploading.includes(missingIndexes[i])) {
                                    [repeat, newStart, newEnd] = shouldRepeat(
                                        fileSize,
                                        variables.CHUNK_SIZE * missingIndexes[i]
                                    );
                                    missingIndex = missingIndexes[i];
                                    break;
                                }
                            }

                            if (!missingIndex) return;

                            return encryptChunkNUpload({
                                key,
                                algorithm,
                                file,
                                start: newStart as number,
                                end: newEnd as number,
                                chunkNumber: missingIndex,
                                id,
                                socket,
                                chunkArray,
                                recovery,
                            });
                        }
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
                    recovery,
                });
            }
        );
    } catch ({ message }) {
        console.log(message as string);
    }
};

const encryptFile = async ({
    file,
    key,
    algorithm,
    id,
    socket,
    startFrom,
}: IEncInit) => {
    try {
        if (!key) return 'No key';
        if (!algorithm) return 'No algorithm';

        const start = startFrom * variables.CHUNK_SIZE;
        const end = start + variables.CHUNK_SIZE - variables.PADDING;
        encryptChunkNUpload({
            key,
            algorithm,
            file,
            start,
            end,
            chunkNumber: startFrom,
            id,
            socket,
            chunkArray: [[0]],
            recovery: startFrom !== 0,
        });
    } catch ({ message }) {
        console.log(message as string);
    }
};

export default encryptFile;
