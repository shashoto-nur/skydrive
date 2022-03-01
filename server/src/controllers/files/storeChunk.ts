import crypto from "crypto";
import File from "../../models/File";
import served from "../../server";

const storeChunk = async (req: any, res: any) => {
    try {
        const { bot } = served;
        const { id, chunk_number }:{ id: string, chunk_number: string } = req.body;
        const chunk = (req.files as Express.Multer.File[])[0];

        if(!chunk) return res.status(400).json({ error: "No chunk provided" });
        const telegramRes = await bot.telegram.sendDocument(process.env.CHAT_ID!, {
            source: chunk.buffer,
            filename: crypto.randomBytes(10).toString('hex')
        });

        const file = await File.findByIdAndUpdate(id, {
            $push: {
                chunks: {
                    number: +chunk_number,
                    id: telegramRes.document.file_id,
                }
            }
        }, { new: true });

        if(!file) return res.status(404).json({ error: "File not found" });
        return res.status(200).json({ file });

    } catch ({ message }) {
        console.log(message);
    };
};

export default storeChunk;