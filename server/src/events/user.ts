import { createUser, loginUser, updatePassword, getEncSpaces, addSpaceIds, addGlobalPin } from '../controllers/users/';

const setUserEvents = (socket: any) => {
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

    socket.on('get_enc_spaces', async () => {
        const res = await getEncSpaces(socket.handshake.auth.userId);
        socket.emit('GET_ENC_SPACES_RESPONSE', { res } );
    });

    socket.on('add_space', async (id: string) => {
        const userId: string = socket.handshake.auth.userId;
        const res = await addSpaceIds(id, userId);
        socket.emit('ADD_SPACE_RESPONSE', { res } );
    });

    socket.on('add_pin', async (pin: string) => {
        const userId: string = socket.handshake.auth.userId;
        const res = await addGlobalPin(pin, userId);
        socket.emit('ADD_PIN_RESPONSE', { res } );
    });
};

export default setUserEvents;