import { sendMail, MailDataType } from '../mail/sendMail';
import User from '../../models/User';


async function addSpaceIds(
    pin: string,
    userId: string
): Promise<string> {
    try {
        const user = await User.addGlobalPin(userId, pin);

        const text = `New pin added for user:${ user.id }`;  
        const subject = 'Pin added';
        const mailData: MailDataType = { receiver: user.email, text, subject };
        await sendMail(mailData, function(response) {
            console.log(response);
        });

        return `Pin added to user:${ user.id }. An update email has been sent to ${ user.email }`;
    } catch(err) {
        const { message } = (err as Error);
        console.log('New error:', message);
        return message;
    };
};

export default addSpaceIds;