import crypto from "crypto";
import File from "../../models/File";
import served from "../../server";

const storeChunk = async (req: any, _res: any) => {
    try {
        console.log(req.body);
        const { bot } = served;
        const { id, chunk_number }:{ id: string, chunk_number: string } = req.body;
        const file = (req.files as Express.Multer.File[])[0];

        if(!file) return;
        const telegramRes = await bot.telegram.sendDocument(process.env.CHAT_ID!, {
            source: file.buffer,
            filename: crypto.randomBytes(10).toString('hex')
        });

        File.findByIdAndUpdate(id, {
            $push: {
                chunks: {
                    chunk_number: chunk_number,
                    id: telegramRes.document.file_id
                }
            }
        });

    } catch ({ message }) {
        console.log(message);
    };
};

export default storeChunk;