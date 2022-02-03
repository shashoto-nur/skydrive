import express from 'express';
import http from 'http';
import * as WebSocket from 'ws';
import { AddressInfo } from 'net';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {

    ws.on('message', (message: string) => {
        console.log(`Message: ${ message }`);
        ws.send(`Message: ${ message }`);
    });

    ws.send('Websocket server online...');
});

server.listen(process.env.PORT || 5000, () => {
    const { port } = server!.address() as AddressInfo;
    console.log(`Server listening on port ${ port }`);
});