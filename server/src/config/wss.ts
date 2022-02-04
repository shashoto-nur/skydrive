import * as WebSocket from 'ws';

import served from '../server';
import createUser from '../controllers/users/createUser';


function initiateWSS(server: any) {
    const wss = new WebSocket.Server({ server });
    const { transporter } = served;

    wss.on('connection', (ws: WebSocket) => {

        ws.on('message', (user: string) => {
            const res = createUser(user, transporter);
            ws.send(res);
        });

        ws.send('Websocket server online...');
    });
};

export default initiateWSS;