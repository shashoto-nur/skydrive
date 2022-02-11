import { useEffect } from 'react';
import { io } from "socket.io-client";
import { Routes, Route, Link } from "react-router-dom";

import logo from './logo.svg';
import { Counter, SignUp, Login, Spaces } from './features';
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

        socket.on("message", ({ res }) => {
            console.log("Socket response: ", { res });
        });
    }, [dispatch, socket]);

    return (
        <div className="App">
            <header className="App-header">
                <Link to="/">SignUp</Link>
                <Link to="/login">Login</Link>
                <Link to="profile">Profile</Link>
                <Link to="/spaces">Spaces</Link>
                <img src={logo} className="App-logo" alt="logo" />
                <Counter /> <br />
                <Routes>
                    <Route path="/" element={ <SignUp /> } />
                    <Route path="login" element={ <Login /> } />
                    <Route path="profile" element={ <Profile /> } />
                    <Route path="spaces" element={ <Spaces /> } />
                </Routes>
            </header>
        </div>
    );
}

export default App;