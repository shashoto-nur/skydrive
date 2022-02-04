import { createTransport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

function initiateTransport() {
    return createTransport({
        service: process.env.MAIL_SERVICE,
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });
}

async function sendMail(receiver: string, text: string, transporter: Transporter<SMTPTransport.SentMessageInfo>) {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: receiver,
        subject: 'OTP from SkyDrive',
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) console.log(error);
        else console.log('Email sent: ' + info.response);
    });
};

export default { initiateTransport, sendMail };