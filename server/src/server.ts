require('dotenv').config();

import http from 'http';
import { AddressInfo } from 'net';

import initiateTransport from './config/mail';
import initiateBot from './config/bot';
import initApp from './config/app';
import initiateSocket from './config/socket';
import connectToDatabase from './config/db';
import startCron from './config/cron';

console.clear();
console.log('\x1b[36m%s\x1b[0m', 'Starting server...')
const transporter = initiateTransport();
const bot = initiateBot();

(async () => {
    await connectToDatabase();

    const app = initApp();
    const server = http.createServer(app);
    initiateSocket(server);
    startCron();

    server.listen(process.env.PORT || 5000, () => {
        const { port } = server!.address() as AddressInfo;
        console.log('\x1b[36m%s\x1b[0m', `Server listening on port ${port}`);
    });

})();

const served = { transporter, bot };
export default served;