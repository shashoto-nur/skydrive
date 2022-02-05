require('dotenv').config();

import http from 'http';
import { AddressInfo } from 'net';
import { CronJob } from 'cron';

import initApp from './config/app';
import initiateWSS from './config/wss';
import connectToDatabase from './config/db';
import { initiateTransport } from './config/mail';
import initiateBot from './config/bot';

console.clear();
console.log('\x1b[36m%s\x1b[0m', 'Starting server...')
const transporter = initiateTransport();
const bot = initiateBot();

(async () => {
    await connectToDatabase();

    const app = initApp();
    const server = http.createServer(app);
    initiateWSS(server);

    new CronJob('0 0 0 * * *', function() {
        console.log("Runs every day at 12:00 AM");
    }, null, true, 'America/Los_Angeles');

    server.listen(process.env.PORT || 5000, () => {
        const { port } = server!.address() as AddressInfo;
        console.log('\x1b[36m%s\x1b[0m', `Server listening on port ${port}`);
    });

})();

const served = { transporter, bot };
export default served;