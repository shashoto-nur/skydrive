import { Server } from 'socket.io';

import setUserID from '../utils/setUserID';
import setUserEvents from '../events/user';
import setSpacesEvents from '../events/spaces';

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

        socket.send({ id: socket.handshake.auth.userId });
    });

    console.log(' Websocket server online...');
}

export default initiateSocket;
