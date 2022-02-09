import { useEffect } from 'react';
import { io } from "socket.io-client";
import {
    Routes,
    Route
} from "react-router-dom";

import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import SignUp from './features/signup/Signup';
import Login from './features/login/Login';
import './App.css';
import { useAppDispatch } from './app/hooks';
import { setGlobalSocketID } from './AppReducer';
import Profile from './features/profile/Profile';

const App = () => {
    const uri = "http://127.0.0.1:5000/";
    const socket = io(uri, {
        transports: ["websocket", "polling"],
        auth: { token: localStorage.getItem('token') }
    });
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setGlobalSocketID(socket))
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

        socket.on("connect", () => {
            console.log("Socket connected: ", socket.id);
        });
        
        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        socket.on("SIGNUP_RESPONSE", ({ res }) => {
            console.log("SignUp response: ", { res });
        });

        socket.on("LOGIN_RESPONSE", ({ res }) => {
            console.log("Login response: ", { res });
            const token = res.token;
            localStorage.setItem('token', token);
        });

        socket.on("UPDATE_PASSWORD_RESPONSE", ({ res }) => {
            console.log("Password update response: ", { res });
        });

        socket.on("message", ({ res }) => {
            console.log("Socket response: ", { res });
        });
    }, [dispatch, socket]);

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <Counter /> <br />
                <Routes>
                    <Route path="/" element={ <SignUp /> } />
                    <Route path="login" element={ <Login /> } />
                    <Route path="profile" element={ <Profile /> } />
                </Routes>
            </header>
        </div>
    );
}

export default App;