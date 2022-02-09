import { Server } from "socket.io";

import served from '../server';
import createUser from '../controllers/users/createUser';
import loginUser from '../controllers/users/loginUser';
import updatePassword from "../controllers/users/updatePassword";


function initiateWSS(server: any) {
    const io = new Server(server);
    const { transporter } = served;

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        console.log(token);
        next();
    })
    .on('connection', (socket: any) => {
        socket.on('signup', async ({ email }: { email: string }) => {
            const res = await createUser(email, transporter);
            socket.emit('SIGNUP_RESPONSE', { res });
        });

        socket.on('login', async ({ email, password }: { email: string, password: string }) => {
            const res = await loginUser({ email, password });
            socket.emit('LOGIN_RESPONSE', { res } );
        });

        socket.on('update_password', async ({ password }: { password: string }) => {
            const res = await updatePassword({ password });
            socket.emit('UPDATE_PASSWORD_RESPONSE', { res } );
        });

        socket.send({ res: 'Connected to server...'});
    });

    console.log(' Websocket server online...');
};

export default initiateWSS;