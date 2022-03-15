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
                receivingStream.on('data', (data: Buffer) => {
                    socket.emit('Get_chunk', {
                        data,
                        number,
                        end: false
                    });
                });

                receivingStream.on('end', () => {
                    callback({ status: 'Data stream is available' });
                    const data = Buffer.alloc(0);
                    socket.emit('Get_chunk', {
                        data,
                        number,
                        end: true
                    });
                });
            });
        });
    } catch ({ message }) {
        console.log(message);
        callback({ status: message as string });
    }
};

export default downloadChunk;
