import { createWriteStream } from 'streamsaver';

import getFileChunk from '../utils/getFileChunk';
import shouldRepeat from '../utils/shouldRepeat';
import variables from '../env/variables';


const decryptFile = async ({ chunks, key, algorithm }: {
    chunks: any;
    key: CryptoKey;
    algorithm: {
        name: string;
        iv: Uint8Array;
    };
}) => {

    const decryptData = async (
        encryptedData: Uint8Array, key: CryptoKey,
        algorithm: { name: string; iv: Uint8Array; }
    ) => {
        try {
            const decryptedData = await window.crypto.subtle.decrypt(algorithm, key, encryptedData);
            const decryptedUint8Data = new Uint8Array(decryptedData);
    
            return decryptedUint8Data;

        } catch ({ message }) { console.log(message as string); };

    };

    const decryptChunkNSave = async (
        writer: WritableStreamDefaultWriter<any>,
        key: CryptoKey, algorithm: { name: string; iv: Uint8Array; },
        file: File, start: number, end: number
    ) => {
        try {
        
            const encryptedChunk = await getFileChunk(file, start, end);
        
            const decryptedChunk = await decryptData(encryptedChunk as Uint8Array, key, algorithm);
    
        
            if(decryptedChunk) {

                writer.write(decryptedChunk);
    
            
                const fileSize = file.size + 1;
                const [repeat, newStart, newEnd] = shouldRepeat(fileSize, end);
                const paddedEnd = newEnd as number + variables.PADDING;
    
            
                if(repeat) decryptChunkNSave(writer, key, algorithm, file, newStart as number, paddedEnd);
                else writer.close();
            };

        } catch ({ message }) { console.log(message as string); };

    };


    try {
        if(key && algorithm) {

        
            const metaDataLen = (await getFileChunk(file, 0, 1) as Uint8Array)[0];
            const encryptedFilename = await getFileChunk(file, 1, metaDataLen);
            const decryptedFilenameArray = await decryptData(encryptedFilename as Uint8Array, key, algorithm);

            if(decryptedFilenameArray) {

            
                const filename = new TextDecoder().decode(decryptedFilenameArray);

            
                const writableStream = createWriteStream(filename);
                const writer = writableStream.getWriter();

            
                const start = metaDataLen, end = metaDataLen + variables.CHUNK_SIZE + variables.PADDING;
                decryptChunkNSave(writer, key, algorithm, file, start, end);
            };

        } else console.log('Key generation failed!');

    } catch ({ message }) { console.log(message as string); };

};


export default decryptFile;