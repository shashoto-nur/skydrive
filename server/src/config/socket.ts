import { Server } from 'socket.io';

import setUserID from '../utils/setUserID';
import { setUserEvents, setSpacesEvents, setFilesEvents } from '../events';

function initiateSocket(server: any) {
    const io = new Server(server, {
        maxHttpBufferSize: 50e8,
    });

    io.use((socket, next) => {
        setUserID(socket);
        next();
    }).on('connection', (socket: any) => {
        setUserEvents(socket);
        setSpacesEvents(socket);
        setFilesEvents(socket);

        socket.handshake.auth.files = [];
        socket.send({ id: socket.handshake.auth.userId });
    });

    console.log(' Websocket server online...');
}

export default initiateSocket;
