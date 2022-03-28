import { createWriteStream } from 'streamsaver';

import variables from '../env';
import { getFileChunk } from '../utils';
import { IDecNSave, IDecInit } from './interfaces';

const decryptAndSave = async (
    encData: Uint8Array,
    { key, algorithm, writer, chunks, number, socket }: IDecNSave
) => {
    try {
        const decryptedData = await window.crypto.subtle.decrypt(
            algorithm,
            key,
            encData
        );
        const decData = new Uint8Array(decryptedData);

        if (!decData) return console.log('No decrypted data');

        writer.write(decData);

        if (chunks.length > number)
            return socket.emit(
                'get_chunk',
                { chunk: chunks[number], number },
                ({ status }: { status: string }) => console.log(status)
            );

        console.log('File downloaded');
        socket.off('Get_chunk');

        return writer.close();
    } catch ({ message }) {
        console.log({ message });
        socket.off('Get_chunk');

        return writer.close();
    }
};

const decryptFile = async ({
    chunks,
    socket,
    name,
    key,
    algorithm,
    startFrom,
    partialDown,
}: IDecInit) => {
    try {
        if (!key) return console.log('No key');
        if (!algorithm) return console.log('No algorithm');

        const writeableStream = createWriteStream(name);
        const writer = writeableStream.getWriter();

        if (startFrom > 0 && typeof partialDown !== 'string') {
            for (let index = 0; index < startFrom; index++) {
                const start = index * variables.CHUNK_SIZE;
                const end = start + variables.CHUNK_SIZE;

                const decChunk = await getFileChunk(partialDown, start, end);
                if (typeof decChunk === 'string') return console.log(decChunk);
                writer.write(decChunk);
            }
        }

        let chunk = new Uint8Array(0);
        socket.on('Get_chunk', ({ data, number, end }) => {
            const encData = new Uint8Array(data);
            chunk = new Uint8Array([...chunk, ...encData]);
            socket.emit('received_buffer_stream');

            if (!end) return;

            decryptAndSave(chunk, {
                key,
                algorithm,
                writer,
                chunks,
                number: number + 1,
                socket,
            });
        });

        const number = 0;
        socket.emit(
            'get_chunk',
            { fileNums: chunks[number], number },
            ({ status }: { status: string }) => console.log(status)
        );
    } catch ({ message }) {
        console.log({ message });
        socket.off('Get_chunk');
    }
};

export default decryptFile;
