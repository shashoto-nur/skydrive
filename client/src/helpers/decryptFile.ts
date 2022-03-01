import { createWriteStream } from 'streamsaver';
import get from 'axios';

const decryptFile = async ({ chunks, key, algorithm }: {
    chunks: [{
        number: number;
        id: string;
    }];
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

        } catch ({ message }) { return message as string; };
    };

    const getFileChunkFromServer = async (chunkId: string) => {
        const result = await get(`${process.env.REACT_APP_SERVER_URL}/download/${chunkId}`, {
          responseType: "blob",
        });
        const uint8Chunk = new Uint8Array(result.data as ArrayBufferLike);

        return uint8Chunk;
    };

    const decryptChunkNSave = async (
        writer: WritableStreamDefaultWriter<any>,
        key: CryptoKey, algorithm: { name: string; iv: Uint8Array; },
        chunkArray: string[], number: number
    ): Promise<string> => {
        try {
            const encryptedChunk = await getFileChunkFromServer(chunkArray[number]);
            const decryptedChunk = await decryptData(encryptedChunk as Uint8Array, key, algorithm);
        
            if(!decryptedChunk) return 'No decrypted data';

            writer.write(decryptedChunk);
        
            if(chunkArray.length <= number) return await decryptChunkNSave(writer, key, algorithm, chunkArray, number + 1);

            writer.close();
            return 'File downloaded';

        } catch ({ message }) { return message as string; };
    };

    try {
        if(!key) return 'No key';
        if(!algorithm) return 'No algorithm';

        let number = 0;

        let chunkArray: string[] = [];
        chunks.forEach(({ number, id }) => (
            chunkArray[number] = id
        ));

        const firstChunk = await getFileChunkFromServer(chunkArray[number]);

        const metaDataLen = firstChunk[0];
        const encryptedFilename = firstChunk.slice(1, metaDataLen + 1);
        const decryptedFilenameArray = await decryptData(encryptedFilename as Uint8Array, key, algorithm);

        if(typeof decryptedFilenameArray === 'string') return decryptedFilenameArray;

        const filename = new TextDecoder().decode(decryptedFilenameArray);
    
        const writableStream = createWriteStream(filename);
        const writer = writableStream.getWriter();
    
        return await decryptChunkNSave(writer, key, algorithm, chunkArray, number + 1);

    } catch ({ message }) { return message as string; };

};


export default decryptFile;