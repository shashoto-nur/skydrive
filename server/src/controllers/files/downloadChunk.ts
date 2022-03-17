import https from 'https';
import { Socket } from 'socket.io';

const downloadChunk = async ({
    fileNums,
    number,
    socket,
    callback,
}: {
    fileNums: [number];
    number: number;
    socket: Socket;
    callback: (arg0: { status: string }) => void;
}) => {
    try {
        fileNums.map((fileNum: number) => {
            https.get(process.env.FILE_LINK! + fileNum, (receivingStream) => {
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
                    callback({ status: 'Data stream is available' });
                    socket.emit('Get_chunk', {
                        data: availableChunk,
                        number,
                        end: true,
                    });
                    socket.off('received_buffer_stream', sendAvailChunk);
                });
            });
        });
    } catch ({ message }) {
        console.log(message);
        callback({ status: message as string });
    }
};

export default downloadChunk;
