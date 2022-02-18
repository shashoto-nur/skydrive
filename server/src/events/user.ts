import {
    createUser,
    loginUser,
    updatePassword,
    getEncSpaces,
    addSpaceIds
} from '../controllers/users/';

const setUserEvents = (socket: any) => {
    socket.on('signup', async ({ email } : { email: string }, callback: (arg0: { res: string; }) => void) => {
        const res = await createUser(email);
        callback({ res });
    });

    socket.on('login', async ({ email, password }: { email: string, password: string }, callback: (arg0: { res: { msg: string; token: string; err: string; }; }) => void) => {
        const { msg, token , err, id } = await loginUser({ email, password });
        socket.handshake.auth.userId = id;
        const res = { msg, token , err, userId: id };
        callback({ res });
    });

    socket.on('update_password', async ({ password }: { password: string }, callback: (arg0: { res: { msg: string; token: string; err: string; }; }) => void) => {
        const id: string = socket.handshake.auth.userId;
        const res = await updatePassword({ id, password });
        callback({ res });
    });

    socket.on('get_enc_spaces', async (callback: (arg0: { res: string; }) => void) => {
        const res = await getEncSpaces(socket.handshake.auth.userId);
        callback({ res });
    });

    socket.on('add_space', async (id: string, callback: (arg0: { res: string; }) => void) => {
        const userId: string = socket.handshake.auth.userId;
        const res = await addSpaceIds(id, userId);
        callback({ res });
    });
};

export default setUserEvents;