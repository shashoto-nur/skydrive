import { createTransport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

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

interface MailDataType {
    receiver: string;
    text: string;
    subject: string;
};

async function sendMail(mailData: MailDataType, transporter: Transporter<SMTPTransport.SentMessageInfo>) {
    const { receiver, text, subject } = mailData;
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: receiver,
        subject,
        text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) console.log(error);
        else console.log('Email sent: ' + info.response);
    });
};

export { initiateTransport, sendMail, MailDataType };