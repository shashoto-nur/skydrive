import { useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import './App.css';

const client = new W3CWebSocket('ws://127.0.0.1:5000');

const App = () => {

    client.onerror = function() {
        console.log('Connection Error');
    };

    client.onopen = function() {
        console.log('WebSocket Client Connected');
    };

    client.onmessage = function(e) {
        if (typeof e.data === 'string') console.log("Received: '" + e.data + "'");
    };

    const [email, setEmail] = useState('Enter your email');
    const onMailChange = (event: React.ChangeEvent<HTMLInputElement>) => { setEmail(event.target.value); };

    const sendEmail = () => {
        if (client.readyState === client.OPEN && email !== 'Enter your email')
            client.send(email);
        else alert('Please enter an email!');
    };

    return (
        <div className="App">
            <header className="App-header">
                <form onSubmit={ event => event.preventDefault() }>
                    <input type="text" name="email" id="email" onChange={ onMailChange } placeholder={ email } />
                    <button type="submit" onClick={ sendEmail }>Send</button>
                </form>
            </header>
        </div>
    );
}

export default App;