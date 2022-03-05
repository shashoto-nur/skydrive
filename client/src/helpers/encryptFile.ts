import axios from "axios";

import getFileChunk from "../utils/getFileChunk";
import shouldRepeat from "../utils/shouldRepeat";

import variables from "../env/variables";

const encryptFile = async ({
    file,
    filename,
    key,
    algorithm,
    id,
}: {
    file: File;
    filename: string;
    key: CryptoKey;
    algorithm: {
        name: string;
        iv: Uint8Array;
    };
    id: string;
}) => {
    let chunkNumber = 0;

    const encryptData = async (
        unencryptedData: Uint8Array,
        key: CryptoKey,
        algorithm: { name: string; iv: Uint8Array }
    ) => {
        try {
            const encryptedData = await window.crypto.subtle.encrypt(
                algorithm,
                key,
                unencryptedData
            );
            const encryptedUint8Data = new Uint8Array(encryptedData);

            return encryptedUint8Data;
        } catch ({ message }) {
            console.log(message as string);
        }
    };

    const uploadChunk = async (encryptedChunk: Uint8Array) => {
        const formData = new FormData();
        const encryptedBlob = new Blob([encryptedChunk.buffer]);

        formData.append("enc_blob", encryptedBlob);
        formData.append("id", id);
        formData.append("chunk_number", chunkNumber.toString());

        const config = {
            headers: {
                "content-type": "multipart/form-data",
            },
        };

        chunkNumber += 1;
        const res = await axios.post(
            process.env.REACT_APP_SERVER_URL!,
            formData,
            config
        );

        console.log(res.data.status);
    };

    const encryptChunkNUpload = async (
        key: CryptoKey,
        algorithm: { name: string; iv: Uint8Array },
        file: File,
        start: number,
        end: number
    ) => {
        try {
            const unencryptedChunk = await getFileChunk(file, start, end);
            if (typeof unencryptedChunk === "string") return unencryptedChunk;
            const encryptedChunk = await encryptData(
                unencryptedChunk,
                key,
                algorithm
            );

            if (!encryptedChunk) return "Error encrypting chunk";
            uploadChunk(encryptedChunk);

            const fileSize = file.size + 1;
            const [repeat, newStart, newEnd] = shouldRepeat(fileSize, end);

            if (!repeat) return "File uploaded successfully";
            encryptChunkNUpload(
                key,
                algorithm,
                file,
                newStart as number,
                newEnd as number
            );
        } catch ({ message }) {
            console.log(message as string);
        }
    };

    try {
        if (!key) return "No key";
        if (!algorithm) return "No algorithm";

        const filenameArray = new TextEncoder().encode(filename);
        const encryptedFilename = await encryptData(
            filenameArray,
            key,
            algorithm
        );

        if (!encryptedFilename) return "No encrypted filename";
        uploadChunk(encryptedFilename);

        const start = 0,
            end = variables.CHUNK_SIZE;
        encryptChunkNUpload(key, algorithm, file, start, end);
    } catch ({ message }) {
        console.log(message as string);
    }
};

export default encryptFile;
