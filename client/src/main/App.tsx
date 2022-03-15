import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Routes, Route, Link } from 'react-router-dom';

import {
    SignUp,
    Profile,
    Login,
    Spaces,
    Upload,
    Space,
    File,
} from '../features';
import { setGlobalKey, setGlobalAlgorithm } from '../features/login/loginSlice';

import './App.css';
import { useAppDispatch } from '../app/hooks';
import {
    setGlobalSocketID,
    setGlobalSpaces,
    setGlobalUserId,
} from './AppSlice';

import { decryptStr } from '../utils/cryptoString';
import deriveKey from '../utils/deriveKey';
import getAlgorithm from '../utils/getAlgorithm';
import { ISpace } from '../features/spaces/spacesSlice';

const App = () => {
    const socket = io(process.env.REACT_APP_SOCKET_URL!, {
        transports: ['websocket', 'polling'],
        auth: { token: localStorage.getItem('token') },
    });
    const dispatch = useAppDispatch();
    const [reRender, setReRender] = useState(false);

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
            const algorithm = getAlgorithm(password) as {
                name: string;
                iv: Uint8Array;
            };
            const key = (await deriveKey(password)) as CryptoKey;

            dispatch(setGlobalKey(key));
            dispatch(setGlobalAlgorithm(algorithm));

            socket.emit('get_enc_spaces', async ({ res }: { res: string }) => {
                try {
                    if (!res) return;

                    const decString = await decryptStr(res, algorithm, key);
                    const receivedSpaces: string[] = JSON.parse(decString);

                    socket.emit(
                        'get_spaces',
                        receivedSpaces,
                        ({ res }: { res: ISpace[] }) => {
                            dispatch(setGlobalSpaces(res));
                        }
                    );
                } catch ({ message }) {
                    console.log({ message });
                }
            });
            setReRender(true);
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
                {reRender ? (
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
                <Routes>
                    <Route path="/" element={<SignUp />} />
                    <Route path="login" element={<Login />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="spaces" element={<Spaces />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="space/:name" element={<Space />} />
                    <Route path="file/:link" element={<File />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;
