import * as WebSocket from 'ws';

import served from '../server';
import createUser from '../controllers/users/createUser';


function initiateWSS(server: any) {
    const wss = new WebSocket.Server({ server });
    const { transporter } = served;

    wss.on('connection', (ws: WebSocket) => {

        ws.on('message', async (email: string) => {
            const res: string = await createUser(email, transporter);
            ws.send(res);
        });

        ws.send('Websocket server online...');
    });

    console.log(' Websocket server online...');
};

export default initiateWSS;