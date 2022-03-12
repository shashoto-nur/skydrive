const reader = new FileReader();

const getFileChunk = (
    file: File,
    start: number,
    end: number
): Promise<string | Uint8Array> => {
    return new Promise((resolve, _reject) => {
        try {
            const chunk = file.slice(start, end);
            reader.readAsArrayBuffer(chunk);

            reader.onloadend = (event) => {
                if (
                    event.target &&
                    event.target.readyState === FileReader.DONE
                ) {
                    const arrayBufferChunk = event.target.result;
                    if (
                        !arrayBufferChunk ||
                        typeof arrayBufferChunk === 'string'
                    )
                        return 'No array buffer chunk';
                    const uint8Chunk = new Uint8Array(arrayBufferChunk);

                    resolve(uint8Chunk);
                }
            };
        } catch ({ message }) {
            return message as string;
        }
    });
};

export default getFileChunk;
