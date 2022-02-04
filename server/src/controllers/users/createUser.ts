import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import mail from '../../config/mail';

function createUser(user: string, transporter: Transporter<SMTPTransport.SentMessageInfo>) {
    console.log(`Provided mail address: ${ user }`);

    const otp = Math.round(Math.random() * 0xFFFFFF);
    const text = `Your OTP is ${ otp }`;
    mail.sendMail(user, text, transporter).catch(console.error);

    return `OTP sent. Check your inbox: ${ user }`;
};

export default createUser;