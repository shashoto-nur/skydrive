import { sendMail, MailDataType } from '../mail/sendMail';
import User from '../../models/User';


async function createUser(
    email: string
): Promise<string> {
    try {
        const password = Math.round(Math.random() * 0xFFFFFF).toString(16);
        const user = await User.signup(email.toString(), password);

        const text = `Your OTP is ${ password }. Login with otp as password at http://localhost:3000/login to verify your account.`;  
        const subject = 'SkyDrive OTP';
        const mailData: MailDataType = { receiver: email, text, subject };
        await sendMail(mailData, function(response) {
            console.log(response);
        });

        return `OTP sent. Check your inbox: ${ email }`;
    } catch(err) {
        const { message } = (err as Error);
        console.log('New error:', message);
        return message;
    };
};

export default createUser;