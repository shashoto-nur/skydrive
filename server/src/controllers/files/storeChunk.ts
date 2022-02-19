import crypto from "crypto";
import served from "../../server";

const storeChunk = async (req: any, _res: any) => {
    try {
        const { bot } = served;
        const file = (req.files as Express.Multer.File[])[0];

        if(!file) return;
        const telegramRes = await bot.telegram.sendDocument(process.env.CHAT_ID!, {
            source: file.buffer,
            filename: crypto.randomBytes(10).toString('hex')
        });

        console.log({telegramRes, file});
    } catch ({ message }) {
        console.log(message);
    };
};

export default storeChunk;