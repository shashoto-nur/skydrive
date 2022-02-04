require('dotenv').config();

import http from 'http';
import { AddressInfo } from 'net';

import initApp from './config/app';
import initiateWSS from './config/wss';
import connectToDatabase from './config/db';
import mail from './config/mail';

const { initiateTransport } = mail;
const transporter = initiateTransport();

(async () => {
    console.clear();
    console.log('\x1b[36m%s\x1b[0m', 'Starting server...')
    await connectToDatabase();

    const app = initApp();
    const server = http.createServer(app);
    initiateWSS(server);

    server.listen(process.env.PORT || 5000, () => {
        const { port } = server!.address() as AddressInfo;
        console.log(`Server listening on port ${port}`);
    });

})();

const served = { transporter };
export default served;