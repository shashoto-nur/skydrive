import { createSpace, getSpaces } from '../controllers/spaces/';
import { createFileObject } from '../controllers/files/';
import { ISpace } from '../models/Space';

const setSpacesEvents = (socket: any) => {
    socket.on('create_space', async ({ space }: { space: string }, callback: (arg0: { spaceIds?: any; res?: string; }) => void) => {
        if(socket.handshake.auth.userId) {
            const newSpaceIds = await createSpace(space);

            socket.handshake.auth.spaceIds = [...socket.handshake.auth.spaceIds, newSpaceIds].filter(el => el !== '');
            callback({ spaceIds: socket.handshake.auth.spaceIds });
        } else 
        callback({ res: 'Unauthorized' });
    });

    socket.on('get_spaces', async (ids: string[], callback: (arg0: { res: string | ISpace[]; }) => void) => {
        if(socket.handshake.auth.userId) {
            socket.handshake.auth.spaceIds = ids;
            const res = await getSpaces(ids);
            callback({ res });
        } else
        callback({ res: 'Unauthorized' });
    });

    socket.on('upload_file', async(fileData: { name: string, size: number, space: string }, callback: (arg0: { id: any; }) => void) => {
        const id: string = await createFileObject(fileData);
        callback({ id });
    });
};

export default setSpacesEvents;