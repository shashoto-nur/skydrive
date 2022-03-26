import { sendMail, MailDataType } from '../mail/sendMail';
import User from '../../models/User';

async function addSpaceId(spaceId: string, userId: string): Promise<string> {
    try {
        const user = await User.findOneAndUpdate(
            { _id: userId },
            {
                $push: {
                    spaces: spaceId,
                },
            },
            { new: true }
        );

        if (!user) return 'User not found';

        const text = `New space created for user:${user.id}`;
        const subject = 'Space created';
        const mailData: MailDataType = { receiver: user.email, text, subject };
        await sendMail(mailData, function (response) {
            console.log(response);
        });

        return 'Space added';
    } catch (err) {
        const { message } = err as Error;
        console.log('New error:', message);
        return message;
    }
}

export default addSpaceId;
