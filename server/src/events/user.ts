import { Types } from 'mongoose';
import {
    createUser,
    loginUser,
    updatePassword,
    getEncSpaces,
    addSpaceIds,
    checkKeyPair,
    storeKeyPair,
    getKeys,
    inviteUser,
    addSharedSpace,
    acceptInvite,
} from '../controllers/users/';

const setUserEvents = (socket: any) => {
    socket.on(
        'signup',
        async (
            { email }: { email: string },
            callback: (arg0: { res: string }) => void
        ) => {
            const res = await createUser(email);
            callback({ res });
        }
    );

    socket.on(
        'login',
        async (
            { email, password }: { email: string; password: string },
            callback: (arg0: {
                res: { msg: string; token: string; err: string };
            }) => void
        ) => {
            const { msg, token, err, id } = await loginUser({
                email,
                password,
            });
            socket.handshake.auth.userId = id;
            const res = { msg, token, err, userId: id };
            callback({ res });
        }
    );

    socket.on(
        'update_password',
        async (
            { password }: { password: string },
            callback: (arg0: {
                res: { msg: string; token: string; err: string };
            }) => void
        ) => {
            const id: string = socket.handshake.auth.userId;
            const res = await updatePassword({ id, password });
            callback({ res });
        }
    );

    socket.on(
        'has_key_pairs',
        async (callback: (arg0: { exists: boolean; err: string }) => void) => {
            const id: string = socket.handshake.auth.userId;
            const res = await checkKeyPair({ id });
            callback(res);
        }
    );

    socket.on(
        'store_key_pairs',
        async (
            { pub, priv }: { pub: JsonWebKey; priv: string },
            callback: (arg0: { err: string | undefined }) => void
        ) => {
            const id: string = socket.handshake.auth.userId;
            const err = await storeKeyPair({ id, pub, priv });
            callback({ err });
        }
    );

    socket.on(
        'get_keys',
        async (
            { otheruser }: { otheruser: string },
            callback: (arg0: { pub: string | JsonWebKey; priv: string }) => void
        ) => {
            const userId: string = socket.handshake.auth.userId;
            const { pub, priv } = await getKeys({ userId, otheruser });
            callback({ pub, priv });
        }
    );

    socket.on(
        'get_enc_spaces_and_invites',
        async (
            callback: (arg0: {
                err?: string | null;
                encSpaces?: string;
                encShared?: string[];
                invites?: {
                    priv: string;
                    pub: string | JsonWebKey;
                    userId: Types.ObjectId;
                    spaceId: Types.ObjectId;
                }[];
            }) => void
        ) => {
            const userId: string = socket.handshake.auth.userId;
            const { encSpaces, encShared, invites, err } = await getEncSpaces(
                userId
            );
            if (!err) return callback({ err });

            callback({ encSpaces, encShared, invites });
        }
    );

    socket.on(
        'add_space',
        async (id: string, callback: (arg0: { res: string }) => void) => {
            const userId: string = socket.handshake.auth.userId;
            const res = await addSpaceIds(id, userId);
            callback({ res });
        }
    );

    socket.on(
        'add_shared_space',
        async (
            encShared: string,
            callback: (arg0: { res: string }) => void
        ) => {
            const userId: string = socket.handshake.auth.userId;
            const res = await addSharedSpace(encShared, userId);
            callback({ res });
        }
    );

    socket.on(
        'invite_user',
        async (
            {
                spaceId,
                otheruser,
                encPass,
            }: {
                spaceId: string;
                otheruser: string;
                encPass: string;
            },
            callback: (arg0: { err: string }) => void
        ) => {
            const userId: string = socket.handshake.auth.userId;
            const err = await inviteUser({
                userId,
                spaceId,
                otheruser,
                encPass,
            });
            callback({ err });
        }
    );

    socket.on(
        'accept_invite',
        async (
            { spaceId }: { spaceId: string },
            callback: (arg0: { encPass: string | undefined; err: string | undefined; }) => void
        ) => {
            const userId: string = socket.handshake.auth.userId;
            const { encPass, err } = await acceptInvite({ userId, spaceId });
            callback({ encPass, err });
        }
    );
};

export default setUserEvents;
