import { Server } from "socket.io";

import setUserID from "../utils/setUserID";
import setUserEvents from "../events/user";
import setSpacesEvents from "../events/spaces";

function initiateSocket(server: any) {
    const io = new Server(server);

    io.use((socket, next) => {
        setUserID(socket);
        next();
    })
    .on('connection', (socket: any) => {
        setUserEvents(socket);
        setSpacesEvents(socket);

        console.log('Socket connected:', socket.id);
        socket.send({ res: 'Connected to server...'});
    });

    console.log(' Websocket server online...');
};

export default initiateSocket;