import { createTransport } from "nodemailer";

function initiateTransport() {
    const transporter = createTransport({
        service: process.env.MAIL_SERVICE,
        port: +process.env.MAIL_PORT!,
        secure: process.env.MAIL_PORT_SECURE === 'true',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    console.log(' Ready to send mail...');
    return transporter;
};

export default initiateTransport;