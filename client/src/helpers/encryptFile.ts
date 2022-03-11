import getFileChunk from "../utils/getFileChunk";
import shouldRepeat from "../utils/shouldRepeat";

import variables from "../env/variables";
import { IEncInit, IEncNUpload } from "./interfaces";

const encryptChunkNUpload = async ({
    key,
    algorithm,
    file,
    start,
    end,
    chunkNumber,
    id,
    socket,
}: IEncNUpload) => {
    try {
        const unencryptedChunk = await getFileChunk(file, start, end);
        if (typeof unencryptedChunk === "string")
            return console.log(unencryptedChunk);

        const encryptedData = await window.crypto.subtle.encrypt(
            algorithm,
            key,
            unencryptedChunk
        );

        const encryptedChunk = new Uint8Array(encryptedData);
        console.log(encryptedChunk)
        socket.emit(
            "store_chunk",
            { chunk: encryptedChunk, number: chunkNumber, id },
            async ({ res }: { res: string }) => console.log(res)
        );

        const fileSize = file.size + 1;
        const [repeat, newStart, newEnd] = shouldRepeat(fileSize, end);

        if (!repeat) return console.log("File uploaded successfully");
        encryptChunkNUpload({
            key,
            algorithm,
            file,
            start: newStart as number,
            end: newEnd as number,
            chunkNumber: chunkNumber + 1,
            id,
            socket,
        });
    } catch ({ message }) {
        console.log(message as string);
    }
};

const encryptFile = async ({ file, key, algorithm, id, socket }: IEncInit) => {
    try {
        if (!key) return "No key";
        if (!algorithm) return "No algorithm";

        const start = 0,
            end = variables.CHUNK_SIZE;
        encryptChunkNUpload({
            key,
            algorithm,
            file,
            start,
            end,
            chunkNumber: 0,
            id,
            socket,
        });
    } catch ({ message }) {
        console.log(message as string);
    }
};

export default encryptFile;
