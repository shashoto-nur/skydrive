import { createWriteStream } from "streamsaver";
import get from "axios";

const decryptFile = async ({
    chunks,
    key,
    algorithm,
}: {
    chunks: [
        {
            number: number;
            id: string;
        }
    ];
    key: CryptoKey;
    algorithm: {
        name: string;
        iv: Uint8Array;
    };
}) => {
    const decryptData = async (
        encryptedData: Uint8Array,
        key: CryptoKey,
        algorithm: { name: string; iv: Uint8Array }
    ) => {
        try {
            const decryptedData = await window.crypto.subtle.decrypt(
                algorithm,
                key,
                encryptedData
            );
            const decryptedUint8Data = new Uint8Array(decryptedData);

            return decryptedUint8Data;
        } catch ({ message }) {
            return message as string;
        }
    };

    const getFileChunkFromServer = async (chunkId: string) => {
        const response = await get(
            `${process.env.REACT_APP_SERVER_URL}/download/${chunkId}`,
            {
                responseType: "blob",
            }
        );

        const { data } = response;
        const uint8Chunk = new Uint8Array(await data.arrayBuffer());

        return uint8Chunk;
    };

    const decryptChunkNSave = async (
        writer: WritableStreamDefaultWriter<any>,
        key: CryptoKey,
        algorithm: { name: string; iv: Uint8Array },
        chunkArray: string[],
        number: number
    ): Promise<string> => {
        try {
            const encryptedChunk = await getFileChunkFromServer(
                chunkArray[number]
            );

            const decryptedChunk = await decryptData(
                encryptedChunk,
                key,
                algorithm
            );

            if (!decryptedChunk) return "No decrypted data";

            writer.write(decryptedChunk);

            if (chunkArray.length <= number)
                return await decryptChunkNSave(
                    writer,
                    key,
                    algorithm,
                    chunkArray,
                    number + 1
                );

            writer.close();
            return "File downloaded";
        } catch ({ message }) {
            return message as string;
        }
    };

    try {
        if (!key) return "No key";
        if (!algorithm) return "No algorithm";

        let chunkArray: string[] = [];
        chunks.forEach(({ number, id }) => (chunkArray[number] = id));
        let number = 0;

        const encryptedFilename = await getFileChunkFromServer(
            chunkArray[number]
        );

        const decryptedFilenameArray = await decryptData(
            encryptedFilename,
            key,
            algorithm
        );

        if (typeof decryptedFilenameArray === "string")
            return decryptedFilenameArray;

        const filename = new TextDecoder().decode(decryptedFilenameArray);

        const writableStream = createWriteStream(filename);
        const writer = writableStream.getWriter();

        return await decryptChunkNSave(
            writer,
            key,
            algorithm,
            chunkArray,
            number + 1
        );
    } catch ({ message }) {
        return message as string;
    }
};

export default decryptFile;
