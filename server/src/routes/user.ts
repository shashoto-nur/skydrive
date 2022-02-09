import { createUser, loginUser, updatePassword } from '../controllers/users/';

const setUserRoutes = (socket: any) => {
    socket.on('signup', async ({ email }: { email: string }) => {
        const res = await createUser(email);
        socket.emit('SIGNUP_RESPONSE', { res });
    });

    socket.on('login', async ({ email, password }: { email: string, password: string }) => {
        const { msg, token , err, id } = await loginUser({ email, password });
        socket.handshake.auth.userId = id;
        const res = { msg, token , err };
        socket.emit('LOGIN_RESPONSE', { res } );
    });

    socket.on('update_password', async ({ password }: { password: string }) => {
        const id: string = socket.handshake.auth.userId;
        const res = await updatePassword({ id, password });
        socket.emit('UPDATE_PASSWORD_RESPONSE', { res } );
    });
};

export default setUserRoutes;