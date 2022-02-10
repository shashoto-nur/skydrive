import served from '../../server';

interface MailDataType {
    receiver: string;
    text: string;
    subject: string;
};

async function sendMail(
    mailData: MailDataType,
    callback: (response: any) => void
) {
    const { transporter } = served;
    const { receiver, text, subject } = mailData;
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: receiver,
        subject,
        text
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) throw error;
        else return callback('Email sent: ' + info.response);
    });
};

export { sendMail, MailDataType };