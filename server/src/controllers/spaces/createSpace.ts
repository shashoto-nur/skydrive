import { sendMail, MailDataType } from '../mail/sendMail';
import User from '../../models/User';


async function createSpace(
    id: string,
    name: string
): Promise<string> {
    try {
        const user = await User.createSpace(id, name);
        console.log(`Created new space: ${ user.space.name }`);

        const text = `New space created ${ user.space.name }`;  
        const subject = 'Space created';
        const mailData: MailDataType = { receiver: user.email, text, subject };
        await sendMail(mailData, function(response) {
            console.log(response);
        });

        return `New space created! You have been notified in your inbox: ${ user.email }`;
    } catch(err) {
        const { message } = (err as Error);
        console.log('New error:', message);
        return message;
    };
};

export default createSpace;