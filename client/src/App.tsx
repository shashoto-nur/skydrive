import { useEffect } from 'react';
import { io } from "socket.io-client";

import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import SignUp from './features/signup/Signup';
import './App.css';
import { useAppDispatch } from './app/hooks';
import { setGlobalSocketID } from './AppReducer';

const App = () => {
    const token = localStorage.getItem('token') as String;
    const uri = "http://127.0.0.1:5000/";
    const socket = io(uri, {
        transports: ["websocket", "polling"],
        auth: cb => { cb(token); }
    });
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setGlobalSocketID(socket))
        socket.on("connect_error", () => {
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

        socket.on("response", ({ res }) => {
            console.log("Socket response: ", { res });
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
                <SignUp />
            </header>
        </div>
    );
}

export default App;