import { createSpace, getSpace, getSpaces } from '../controllers/spaces/';

import { ISpace } from '../models/Space';

import { Socket } from 'socket.io';

const setSpacesEvents = (socket: Socket) => {
    socket.on(
        'create_space',
        async (
            {
                name,
                location,
                baseSpace,
                parentLoc,
            }: {
                name: string;
                location: string;
                baseSpace: string;
                parentLoc: string;
            },
            callback: (arg0: {
                spaceIds?: any;
                res?: string;
                isBaseSpace?: boolean;
            }) => void
        ) => {
            if (socket.handshake.auth.userId) {
                const newSpaceId = await createSpace(
                    name,
                    location,
                    baseSpace,
                    parentLoc
                );

                const isBaseSpace = !baseSpace;

                if (isBaseSpace)
                    socket.handshake.auth.spaceIds = socket.handshake.auth
                        .spaceIds
                        ? [
                              ...socket.handshake.auth.spaceIds,
                              newSpaceId,
                          ].filter((el) => el !== '')
                        : [newSpaceId];
                callback({
                    spaceIds: socket.handshake.auth.spaceIds,
                    isBaseSpace,
                });
            } else callback({ res: 'Unauthorized' });
        }
    );

    socket.on(
        'get_spaces',
        async (
            ids: string[],
            callback: (arg0: { res: string | ISpace[] }) => void
        ) => {
            if (socket.handshake.auth.userId) {
                socket.handshake.auth.spaceIds = ids;
                const res = await getSpaces(ids);
                callback({ res });
            } else callback({ res: 'Unauthorized' });
        }
    );

    socket.on(
        'get_space',
        async (
            {
                location,
                id,
            }: {
                location: string;
                id: string;
            },
            callback: (arg0: {
                space: ISpace | undefined;
                err: string | undefined;
            }) => void
        ) => {
            const res = await getSpace({ location, id });
            if (typeof res === 'string')
                return callback({ space: undefined, err: res });
            callback({ space: res, err: undefined });
        }
    );
};

export default setSpacesEvents;
