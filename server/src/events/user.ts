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
                invites?: {
                    userId: Types.ObjectId;
                    spaceId: Types.ObjectId;
                }[];
            }) => void
        ) => {
            const { user, err } = await getEncSpaces(
                socket.handshake.auth.userId
            );
            if (!user) return callback({ err });

            const encSpaces = user.spaces;
            const invites = user.invitedTo;
            invites.map((invite) => {
                delete invite.encKey;
                delete invite.encAlgo;
            });
            callback({ encSpaces, invites });
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
        'invite_user',
        async (
            {
                spaceId,
                otheruser,
                encKey,
                encAlgo,
            }: {
                spaceId: string;
                otheruser: string;
                encKey: string;
                encAlgo: string;
            },
            callback: (arg0: { err: string }) => void
        ) => {
            const userId: string = socket.handshake.auth.userId;
            const err = await inviteUser({
                userId,
                spaceId,
                otheruser,
                encKey,
                encAlgo,
            });
            callback({ err });
        }
    );
};

export default setUserEvents;
