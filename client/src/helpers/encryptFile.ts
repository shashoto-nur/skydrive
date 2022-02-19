import axios from 'axios';

import getFileChunk from '../utils/getFileChunk';
import shouldRepeat from '../utils/shouldRepeat';

import variables from '../env/variables';

const encryptFile = async ({ file, filename, key, algorithm, id }: { file: File, filename: string, key: CryptoKey, algorithm: {
    name: string;
    iv: Uint8Array;
}, id: string }) => {
    let chunkNumber = 0;

    const encryptData = async (
        unencryptedData: Uint8Array, key: CryptoKey,
        algorithm: { name: string; iv: Uint8Array; }
    ) => {
        try {
            const encryptedData = await window.crypto.subtle.encrypt(algorithm, key, unencryptedData);
            const encryptedUint8Data = new Uint8Array(encryptedData);
    
            return encryptedUint8Data;

        } catch ({ message }) { console.log(message as string); };
    };

    const uploadChunk = async (encryptedChunk: Uint8Array) => {
        const formData = new FormData();
        const encryptedBlob = new Blob([encryptedChunk.buffer]);
        formData.append('enc_blob', encryptedBlob);
        formData.append('id', id);
        formData.append('chunk_number', chunkNumber.toString());

        const API_URL = 'http://127.0.0.1:5000/server';
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };

        chunkNumber += 1;
        axios.post(API_URL, formData, config);
    };

    const encryptChunkNUpload = async(
        key: CryptoKey, algorithm: { name: string; iv: Uint8Array; },
        file: File, start: number, end: number
    ) => {
        try {
            const unencryptedChunk = await getFileChunk(file, start, end) as Uint8Array;
            const encryptedChunk = await encryptData(unencryptedChunk, key, algorithm);
    
            if(encryptedChunk) {
                uploadChunk(encryptedChunk);

                const fileSize = file.size + 1;
                const [repeat, newStart, newEnd] = shouldRepeat(fileSize, end);
    
                if(repeat) encryptChunkNUpload(key, algorithm, file, newStart as number, newEnd as number);
            };

        } catch ({ message }) { console.log(message as string); };

    };

    try {
        if(key && algorithm) {
            const filenameArray = new TextEncoder().encode(filename);
            const encryptedFilename = (await encryptData(filenameArray, key, algorithm)) as any;

            if(encryptedFilename) {
                const metaDataLen = encryptedFilename.length + 1;
                const metaData = new Uint8Array([...[metaDataLen], ...encryptedFilename])
                uploadChunk(metaData);

                const start = 0, end = variables.CHUNK_SIZE;
                encryptChunkNUpload(key, algorithm, file, start, end);

            } else console.log('Filename encryption failed!');

        } else console.log('Key generation failed!');

    } catch ({ message }) { console.log(message as string); };

};


export default encryptFile;