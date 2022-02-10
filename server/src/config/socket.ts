import { Server } from "socket.io";

import setUserID from "../utils/setUserID";
import setUserRoutes from "../routes/user";
import setSpacesRoutes from "../routes/spaces";

function initiateSocket(server: any) {
    const io = new Server(server);

    io.use((socket, next) => {
        setUserID(socket);
        next();
    })
    .on('connection', (socket: any) => {
        setUserRoutes(socket);
        setSpacesRoutes(socket);

        console.log('Socket connected:', socket.id);
        socket.send({ res: 'Connected to server...'});
    });

    console.log(' Websocket server online...');
};

export default initiateSocket;