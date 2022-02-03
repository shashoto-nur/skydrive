import { w3cwebsocket as W3CWebSocket } from "websocket";
import logo from './logo.svg';
import './App.css';

const client = new W3CWebSocket('ws://127.0.0.1:5000');

const App = () => {

  client.onerror = function() {
      console.log('Connection Error');
  };

  client.onopen = function() {
      console.log('WebSocket Client Connected');

      if (client.readyState === client.OPEN) {
          var number = Math.round(Math.random() * 0xFFFFFF);
          client.send(number.toString());
      };
  };

  client.onmessage = function(e) {
      if (typeof e.data === 'string') console.log("Received: '" + e.data + "'");
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
