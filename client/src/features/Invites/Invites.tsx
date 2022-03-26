import { Socket } from "socket.io-client";
import { useAppSelector } from "../../app/hooks";
import { IInvitedTo, selectInvitedTo, selectPriv, selectSocket } from "../../main/AppSlice";
import { decryptStr, deriveComKey, encryptStr } from "../../utils";
import { selectKey, selectAlgorithm } from "../login/loginSlice";

const Invites = () => {

    const socket = useAppSelector(selectSocket) as Socket;
    const priv = useAppSelector(selectPriv);
    const invitedTo = useAppSelector(selectInvitedTo);
    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    const acceptInvite = (invite: IInvitedTo) => {
        return () => {
            if (!key || !algorithm) return console.log('no key or algorithm');
            const {
                space: { _id },
                user: { pub },
            } = invite;

            socket.emit(
                'accept_invite',
                { spaceId: _id },
                async ({ err, encPass }: { err: string; encPass: string }) => {
                    if (err || !encPass) return console.log('Error: ', err);
                    if (typeof pub === 'string' || !priv)
                        return console.log('no pub or priv');

                    const decPriv = await decryptStr(priv, algorithm, key);
                    const privJwk: JsonWebKey = JSON.parse(decPriv);

                    const comKey = await deriveComKey(pub, privJwk);
                    const decPass = await decryptStr(
                        encPass,
                        algorithm,
                        comKey
                    );

                    const reEncPass = await encryptStr(decPass, algorithm, key);
                    const shared = { pass: reEncPass, spaceId: _id };

                    return socket.emit(
                        'add_shared_space',
                        { shared },
                        ({ res }: { res: string }) => {
                            console.log(res);
                        }
                    );
                }
            );
        };
    };

    return (
        <div>
            <h1>Invites</h1>
            {invitedTo
                ? invitedTo.map((invite) => (
                      <>
                          <h1>{invite.space.name}</h1>
                          <p>{invite.user.email} invited you to join</p>
                          <button
                              className="button"
                              onClick={acceptInvite(invite)}
                          >
                              Accept
                          </button>
                      </>
                  ))
                : <>Empty</>}
        </div>
    );
}

export default Invites;