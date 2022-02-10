import { createSpace, getSpaces } from '../controllers/spaces/';

const setSpacesRoutes = (socket: any) => {
    socket.on('create_space', async ({ space }: { space: string }) => {
        const res = await createSpace(socket.handshake.auth.userId, space);
        socket.emit('CREATE_SPACE_RESPONSE', { res });
    });

    socket.on('get_spaces', async () => {
        const res = await getSpaces(socket.handshake.auth.userId);
        socket.emit('GET_SPACE_RESPONSE', { res } );
    });
};

export default setSpacesRoutes;