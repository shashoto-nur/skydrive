import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Routes, Route, Link } from 'react-router-dom';

import { SignUp, Profile, Login, Spaces, View, File } from '../features';
import {
    setGlobalKey,
    setGlobalAlgorithm,
    selectKey,
    selectAlgorithm,
} from '../features/login/loginSlice';

import './App.css';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
    IInvitedTo,
    IShared,
    setGlobalShareds,
    setGlobalSocketID,
    setGlobalSpaces,
    setGlobalUserId,
} from './AppSlice';

import {
    deriveKey,
    getAlgorithm,
    decryptStr,
    deriveComKey,
    encryptStr,
} from '../utils';
import { ISpace } from '../features/spaces/spacesSlice';

const App = () => {
    const socket = io(process.env.REACT_APP_SOCKET_URL!, {
        transports: ['websocket', 'polling'],
        auth: { token: localStorage.getItem('token') },
    });
    const dispatch = useAppDispatch();
    const [invitedTo, setInvitedTo] = useState<IInvitedTo[] | null>(null);

    const key = useAppSelector(selectKey);
    const algorithm = useAppSelector(selectAlgorithm);

    useEffect(() => {
        dispatch(setGlobalSocketID(socket));

        socket.on('connect_error', async (err) => {
            console.log(`connect_error due to ${err.message}`);
            const pause = (time = 0) => {
                return new Promise<void>((resolve) => {
                    setTimeout(() => resolve(), time >= 0 ? time : 0);
                });
            };

            for (let i = 0; i < 3; i++) {
                await pause(1000);
                if (socket.connected === false) socket.connect();
            }
        });

        socket.on('message', async ({ id }) => {
            if (!id) {
                const loginLink = document.getElementById('login');
                if (loginLink) return loginLink.click();
                return console.log('no login link');
            }

            dispatch(setGlobalUserId(id));
            const encPassword = localStorage.getItem('encPassword');

            const tempKey = (await deriveKey(id)) as CryptoKey;
            const tempAlgorithm = getAlgorithm(id) as {
                name: string;
                iv: Uint8Array;
            };

            const password = await decryptStr(
                encPassword!,
                tempAlgorithm,
                tempKey
            );
            const algorithm = getAlgorithm(password);
            const key = await deriveKey(password);
            if (!key || !algorithm) return console.log('no key or algorithm');

            dispatch(setGlobalKey(key));
            dispatch(setGlobalAlgorithm(algorithm));

            socket.emit(
                'get_enc_spaces_and_invites',
                async ({
                    err,
                    encSpaces,
                    encShared,
                    invites,
                }: {
                    err: string | null;
                    encSpaces: string;
                    encShared: string[];
                    invites: IInvitedTo[];
                }) => {
                    try {
                        if (err) return console.log(err);

                        const decString = await decryptStr(
                            encSpaces,
                            algorithm,
                            key
                        );
                        let receivedSpaces: string[] = JSON.parse(decString);
                        const decShared = await Promise.all(
                            encShared.map(async (enc) => {
                                const dec = await decryptStr(
                                    enc,
                                    algorithm,
                                    key
                                );
                                const shared: IShared = JSON.parse(dec);
                                receivedSpaces.push(shared.spaceId);
                                return shared;
                            })
                        );
                        dispatch(setGlobalShareds(decShared));

                        socket.emit(
                            'get_spaces',
                            receivedSpaces,
                            ({ res }: { res: ISpace[] }) => {
                                dispatch(setGlobalSpaces(res));
                            }
                        );
                        setInvitedTo(invites);
                    } catch ({ message }) {
                        console.log({ message });
                    }
                }
            );
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    const logout = () => {
        localStorage.clear();
        window.location.reload();
    };

    const acceptInvite = (invite: IInvitedTo) => {
        return () => {
            if (!key || !algorithm) return console.log('no key or algorithm');
            const { space, priv, pub } = invite;
            const { _id } = space;
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

                    const shared = { pass: decPass, spaceId: _id };
                    const encShared = await encryptStr(
                        JSON.stringify(shared),
                        algorithm,
                        key
                    );
                    return socket.emit(
                        'add_shared_space',
                        {
                            encShared,
                        },
                        ({ res }: { res: string }) => {
                            console.log(res);
                        }
                    );
                }
            );
        };
    };

    return (
        <div className="App">
            <header className="App-header">
                <Link className="Link" to="/">
                    SignUp
                </Link>
                <Link id="login" className="Link" to="login">
                    Login
                </Link>
                {invitedTo ? (
                    <>
                        <Link className="Link" to="profile">
                            Profile
                        </Link>
                        <Link className="Link" to="spaces">
                            Spaces
                        </Link>
                        <Link className="Link" to="upload">
                            Upload
                        </Link>
                    </>
                ) : null}
                <br />
                <button className="button" onClick={logout}>
                    Logout
                </button>
            </header>
            <main>
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
                    : null}
                <Routes>
                    <Route path="/" element={<SignUp />} />
                    <Route path="login" element={<Login />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="spaces" element={<Spaces />} />
                    <Route path="view/:baseSpace" element={<View />} />
                    <Route path="view/:baseSpace/*" element={<View />} />
                    <Route path="file/:link" element={<File />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;
