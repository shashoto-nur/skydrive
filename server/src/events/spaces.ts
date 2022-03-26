import { createSpace, getSpace, getSpaces } from '../controllers/spaces/';

import { ISpace } from '../models/Space';

import { Socket } from 'socket.io';
import { ICreateSpace } from '../controllers/spaces/createSpace';

const setSpacesEvents = (socket: Socket) => {
    socket.on(
        'create_space',
        async (
            spaceObj: ICreateSpace,
            callback: (arg0: { res?: string; newSpaceId?: string }) => void
        ) => {
            if (socket.handshake.auth.userId) {
                const newSpaceId = await createSpace(spaceObj);
                callback({
                    newSpaceId,
                });
            } else callback({ res: 'Unauthorized' });
        }
    );

    socket.on(
        'get_space',
        async (
            { location }: { location: string },
            callback: (arg0: {
                space?: ISpace;
                err?: string;
            }) => void
        ) => {
            const userId = socket.handshake.auth.userId;
            if(!userId) return callback({ err: 'Unauthorized' });

            const res = await getSpace({ location, userId });

            if (typeof res === 'string')
                return callback({ err: res });
            callback({ space: res });
        }
    );
};

export default setSpacesEvents;
