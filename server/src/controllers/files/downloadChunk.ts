import https from 'https';
import { Socket } from 'socket.io';

interface IDownloadChunk {
    fileNums: [number];
    number: number;
    socket: Socket;
    callback: (arg0: { status: string }) => void;
}

interface IDownloadSlice extends IDownloadChunk {
    index: number;
}

const downloadSlice = async ({
    fileNums,
    index,
    number,
    socket,
    callback,
}: IDownloadSlice) => {
    https.get(process.env.FILE_LINK! + fileNums[index], (receivingStream) => {
        let availableChunk = Buffer.alloc(0);
        let isInitBuf = true;

        const sendAvailChunk = (): NodeJS.Timeout | undefined => {
            if (availableChunk.length <= 0)
                return setTimeout(() => sendAvailChunk(), 100);

            socket.emit('Get_chunk', {
                data: availableChunk,
                number,
                end: false,
            });

            availableChunk = Buffer.alloc(0);
        };

        socket.on('received_buffer_stream', sendAvailChunk);

        receivingStream.on('data', (data: Buffer) => {
            availableChunk = Buffer.concat([availableChunk, data]);
            if (!isInitBuf) return;

            socket.emit('Get_chunk', {
                data: availableChunk,
                number,
                end: false,
            });

            isInitBuf = false;
            availableChunk = Buffer.alloc(0);
        });

        receivingStream.on('end', () => {
            const newIndex = index + 1;
            const isLastSlice = fileNums.length <= newIndex ? true : false;

            isLastSlice && callback({ status: 'Data stream is available' });
            socket.emit('Get_chunk', {
                data: availableChunk,
                number,
                end: true && isLastSlice,
            });
            socket.off('received_buffer_stream', sendAvailChunk);

            if (isLastSlice) return;
            downloadSlice({
                fileNums,
                index: newIndex,
                number,
                socket,
                callback,
            });
        });

        receivingStream.on('close', () => {
            console.log('Connection closed');
        });

        receivingStream.on('error', (err) => {
            console.log(err);
        });
    });
};

const downloadChunk = async ({
    fileNums,
    number,
    socket,
    callback,
}: IDownloadChunk) => {
    try {
        const index = 0;
        downloadSlice({ fileNums, index, number, socket, callback });
    } catch ({ message }) {
        console.log(message);
        callback({ status: message as string });
    }
};

export default downloadChunk;
