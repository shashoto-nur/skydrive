import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Routes, Route, Link } from "react-router-dom";

import logo from './logo.svg';
import { SignUp, Profile, Login, Spaces, Upload, Space } from './features';
import { setGlobalKey, setGlobalAlgorithm } from './features/login/loginSlice';

import './App.css';
import { useAppDispatch } from './app/hooks';
import { setGlobalSocketID, setGlobalSpaces, setGlobalUserId } from './AppSlice';

import { decryptStr } from './utils/cryptoString';
import deriveKey from './utils/deriveKey';
import getAlgorithm from './utils/getAlgorithm';
import { ISpace } from "./features/spaces/spacesSlice";

const App = () => {
    const socket = io(process.env.REACT_APP_SOCKET_URL!, {
        transports: ["websocket", "polling"],
        auth: { token: localStorage.getItem('token') }
    });
    const dispatch = useAppDispatch();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        dispatch(setGlobalSocketID(socket));

        socket.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);

            let runCount = 0;
            function tryToConnect() {
                runCount++;
                if(runCount > 3) clearInterval(connectInterval);
                socket.connect();
            };
            const connectInterval = setTimeout(() => {
                tryToConnect();
            }, 1000);
        });

        socket.on("message", async ({ id }) => {
            if(!id) {
                const loginLink = document.getElementById('login');
                if(loginLink) return loginLink.click();
                return console.log('no login link');
            };

            dispatch(setGlobalUserId(id));
            const encPassword = localStorage.getItem('encPassword');

            const tempKey = await deriveKey(id) as CryptoKey;
            const tempAlgorithm = getAlgorithm(id) as { name: string; iv: Uint8Array; };

            const password = await decryptStr(encPassword!, tempAlgorithm, tempKey);
            const algorithm = getAlgorithm(password) as { name: string; iv: Uint8Array; };
            const key = await deriveKey(password) as CryptoKey;

            dispatch(setGlobalKey(key));
            dispatch(setGlobalAlgorithm(algorithm));

            socket.emit('get_enc_spaces', async ({ res }: { res: string }) => {
                try {
                    if(!res) return;

                    const decString = await decryptStr(res, algorithm, key);
                    const receivedSpaces: string[] = JSON.parse(decString);

                    socket.emit('get_spaces', receivedSpaces, ({ res }: { res: ISpace[] }) => {
                        dispatch(setGlobalSpaces(res));
                    });
                } catch ({ message }) {
                    console.log({ message });
                };
            });
            setIsReady(true);
        });
    }, [socket, dispatch]);

    return (
      <div className="App">
        <header className="App-header">
          <Link className="Link" to="/">
            SignUp
          </Link>
          <Link id="login" className="Link" to="login">
            Login
          </Link>
          {isReady ? (
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
          <button className="button" onClick={() => localStorage.clear()}>
            Logout
          </button>
          <img src={logo} className="App-logo" alt="logo" />
          {isReady ? (
            <Routes>
              <Route path="/" element={<SignUp />} />
              <Route path="login" element={<Login />} />
              <Route path="profile" element={<Profile />} />
              <Route path="spaces" element={<Spaces />} />
              <Route path="upload" element={<Upload />} />
              <Route path="space/:name" element={<Space />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<SignUp />} />
              <Route path="login" element={<Login />} />
            </Routes>
          )}
        </header>
      </div>
    );
}

export default App;