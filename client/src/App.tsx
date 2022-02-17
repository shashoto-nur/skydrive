import { io } from "socket.io-client";
import { Routes, Route, Link } from "react-router-dom";

import logo from './logo.svg';
import { Counter, SignUp, Profile, Login, Spaces, Pin } from './features';
import { setGlobalKey, setGlobalAlgorithm } from './features/login/loginSlice';

import './App.css';
import { useAppDispatch } from './app/hooks';
import { setGlobalSocketID } from './AppSlice';

import { decryptStr } from './utils/cryptoString';
import deriveKey from './utils/deriveKey';
import getAlgorithm from './utils/getAlgorithm';

const App = () => {
    const uri = "http://127.0.0.1:5000/";
    const socket = io(uri, {
        transports: ["websocket", "polling"],
        auth: { token: localStorage.getItem('token') }
    });
    const dispatch = useAppDispatch();

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
        const tempKey = await deriveKey(id) as CryptoKey;
        const tempAlgorithm = getAlgorithm(id) as { name: string; iv: Uint8Array; };

        const encPassword = localStorage.getItem('encPassword');
        if(!encPassword) {
            window.location.href = '/login';
            return;
        };

        const password = await decryptStr(encPassword, tempAlgorithm, tempKey);
        const algorithm = getAlgorithm(password) as { name: string; iv: Uint8Array; };
        const key = await deriveKey(password) as CryptoKey;

        dispatch(setGlobalKey(key));
        dispatch(setGlobalAlgorithm(algorithm));
    });

    return (
        <div className="App">
            <header className="App-header">
                <Link className="Link" to="/">SignUp</Link>
                <Link className="Link" to="login">Login</Link>
                <Link className="Link" to="profile">Profile</Link>
                <Link className="Link" to="spaces">Spaces</Link>
                <Link className="Link" to="pin">Pin</Link>
                <br />

                <button className="button"
                    onClick={ () => localStorage.clear() }>
                    Logout
                </button>

                <img src={logo} className="App-logo" alt="logo" />
                <Counter /> <br />

                <Routes>
                    <Route path="/" element={ <SignUp /> } />
                    <Route path="login" element={ <Login /> } />
                    <Route path="profile" element={ <Profile /> } />
                    <Route path="spaces" element={ <Spaces /> } />
                    <Route path="pin" element={ <Pin /> } />
                </Routes>
            </header>
        </div>
    );
}

export default App;