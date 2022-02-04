require('dotenv').config();
import express from 'express';
import http from 'http';
import * as WebSocket from 'ws';
import { AddressInfo } from 'net';
import { createTransport } from "nodemailer";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const transporter = createTransport({
    service: process.env.MAIL_SERVICE,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
});

async function sendMail(mail: string, otp: number) {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: mail,
        subject: 'OTP from SkyDrive',
        text: `Your OTP is ${ otp }`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) console.log(error);
        else console.log('Email sent: ' + info.response);
    });
}

wss.on('connection', (ws: WebSocket) => {

    ws.on('message', (mail: string) => {
        console.log(`Provided mail address: ${ mail }`);

        const otp = Math.round(Math.random() * 0xFFFFFF);
        sendMail(mail, otp).catch(console.error);

        ws.send(`OTP sent. Check your email: ${ mail }`);
    });

    ws.send('Websocket server online...');
});

server.listen(process.env.PORT || 5000, () => {
    const { port } = server!.address() as AddressInfo;
    console.log(`Server listening on port ${ port }`);
});