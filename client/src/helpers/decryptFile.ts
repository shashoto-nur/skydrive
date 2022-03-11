import { createWriteStream } from "streamsaver";
import { IDecNSave, IDecInit } from "./interfaces";

const downloadChunk = async (
    { key, algorithm, writer, chunks, number, socket }: IDecNSave,
    callback: (encData: Uint8Array, decNSave: IDecNSave) => Promise<void>
) => {
    const decNSave = { key, algorithm, writer, chunks, number, socket };
    socket.emit(
        "get_chunk",
        chunks[number],
        async ({ chunk }: { chunk: Buffer }) => {
            const encData = new Uint8Array(chunk);
            await callback(encData, decNSave);
        }
    );
};

const decryptAndSave = async (
    encData: Uint8Array,
    { key, algorithm, writer, chunks, number, socket }: IDecNSave
) => {
    const decryptedData = await window.crypto.subtle.decrypt(
        algorithm,
        key,
        encData
    );
    const decData = new Uint8Array(decryptedData);

    if (!decData) return console.log("No decrypted data");

    writer.write(decData);

    if (chunks.length <= number)
        return await downloadChunk(
            { key, algorithm, writer, chunks, number: number + 1, socket },
            decryptAndSave
        );

    writer.close();
    console.log("File downloaded");
};

const decryptFile = async ({ chunks, socket, name, key, algorithm }: IDecInit) => {
    try {
        if (!key) return console.log("No key");
        if (!algorithm) return console.log("No algorithm");

        const { getWriter } = createWriteStream(name);
        const writer = getWriter();

        await downloadChunk(
            { key, algorithm, writer, chunks, number: 0, socket },
            decryptAndSave
        );
    } catch ({ message }) {
        console.log(message);
    }
};

export default decryptFile;
