import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";

import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import './App.css';


const App = () => {
    const token = localStorage.getItem('token') as String;
    const uri = "http://127.0.0.1:5000/";
    let socket = io(uri, {
        transports: ["websocket", "polling"],
        auth: cb => { cb(token); }
    });

    useEffect(() => {
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
    }, [socket]);

    const [email, setEmail] = useState('Enter your email');
    const onMailChange = (event: React.ChangeEvent<HTMLInputElement>) => { setEmail(event.target.value); };

    const sendEmail = () => {
        if (email !== 'Enter your email')
            socket.emit('signup', { email });
        else alert('Please enter an email!');
    };
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <Counter /> <br />
                <form onSubmit={ event => event.preventDefault() }>
                    <input type="text" name="email" className="textbox" onChange={ onMailChange } placeholder={ email } />
                    <button type="submit" className="button" onClick={ sendEmail }>Send</button>
                </form>
            </header>
        </div>
    );
}

export default App;