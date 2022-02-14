import { createSpace, getSpaces } from '../controllers/spaces/';

const setSpacesEvents = (socket: any) => {
    socket.on('create_space', async ({ space }: { space: string }) => {
        if(socket.handshake.auth.userId) {
            const newSpaceIds = await createSpace(space);

            socket.handshake.auth.spaceIds = [...socket.handshake.auth.spaceIds, newSpaceIds].filter(el => el !== '');
            socket.emit('CREATE_SPACE_RESPONSE', { spaceIds: socket.handshake.auth.spaceIds });
        } else 
            socket.emit('CREATE_SPACE_RESPONSE', { res: 'Unauthorized' });
    });

    socket.on('get_spaces', async (ids: string[]) => {
        if(socket.handshake.auth.userId) {
            socket.handshake.auth.spaceIds = ids;
            const res = await getSpaces(ids);
            socket.emit('GET_SPACE_RESPONSE', { res } );
        } else
            socket.emit('GET_SPACE_RESPONSE', { res: 'Unauthorized' });
    });
};

export default setSpacesEvents;