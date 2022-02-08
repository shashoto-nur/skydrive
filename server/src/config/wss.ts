import { Server } from "socket.io";

import served from '../server';
import createUser from '../controllers/users/createUser';


function initiateWSS(server: any) {
    const io = new Server(server);
    const { transporter } = served;

    io.on('connection', (socket: any) => {
        socket.on('signup', async ({ email }: { email: string }) => {
            const res = await createUser(email, transporter);
            socket.emit('response', { res });
        });

        socket.send({ res: 'Connected to server...'});
    });

    console.log(' Websocket server online...');
};

export default initiateWSS;