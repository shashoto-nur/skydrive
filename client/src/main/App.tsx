import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Routes, Route, Link } from 'react-router-dom';

import { SignUp, Profile, Login, Spaces, View, File, Invites } from '../features';
import {
    setGlobalKey,
    setGlobalAlgorithm,
} from '../features/login/loginSlice';

import './App.css';
import { useAppDispatch } from '../app/hooks';
import {
    IInvitedTo,
    IPopulatedUser,
    setGlobalPriv,
    setGlobalShareds,
    setGlobalSocketID,
    setGlobalSpaces,
    setGlobalUserId,
    setGlobalInvitedTo
} from './AppSlice';

import {
    deriveKey,
    getAlgorithm,
    decryptStr,
} from '../utils';

const App = () => {
    const socket = io(process.env.REACT_APP_SOCKET_URL!, {
        transports: ['websocket', 'polling'],
        auth: { token: localStorage.getItem('token') },
    });
    const dispatch = useAppDispatch();
    const [invitedTo, setInvitedTo] = useState<IInvitedTo[] | null>(null);

    useEffect(() => {
        dispatch(setGlobalSocketID(socket));

        socket.on('connect_error', async (err) => {
            console.log(`connect_error due to ${err.message}`);
            if (socket.connected === false) socket.connect();
        });

        socket.on('message', async ({ id }) => {
            if (!id) {
                const loginLink = document.getElementById('login');
                if (loginLink) return loginLink.click();
                return console.log('no login link');
            }

            dispatch(setGlobalUserId(id));
            const encPassword = localStorage.getItem('encPassword');

            const tempKey = await deriveKey(id);
            const tempAlgorithm = getAlgorithm(id);
            if (!tempKey || !tempAlgorithm)
                return console.log('no temp key or algorithm');

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
                'get_user',
                async ({
                    err,
                    user,
                }: {
                    err: string | null;
                    user: IPopulatedUser;
                }) => {
                    try {
                        if (err) return console.log(err);

                        const { spaces, shared, invitedTo, priv } = user;
                        dispatch(setGlobalSpaces(spaces));
                        dispatch(setGlobalShareds(shared));
                        dispatch(setGlobalPriv(priv));
                        dispatch(setGlobalInvitedTo(invitedTo));

                        setInvitedTo(invitedTo);
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
                <Invites />
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
