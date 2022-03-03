import crypto from "crypto";
import File from "../../models/File";
import served from "../../server";
import get from "axios";

const storeChunk = async (req: any, res: any) => {
    try {
        const { bot } = served;
        const { id, chunk_number }: { id: string; chunk_number: string } =
            req.body;
        const chunk = (req.files as Express.Multer.File[])[0];

        if (!chunk) return res.status(400).json({ error: "No chunk provided" });
        console.log(chunk.buffer.toString("base64"));
        const telegramRes = await bot.telegram.sendDocument(
            process.env.CHAT_ID!,
            {
                source: chunk.buffer,
                filename: crypto.randomBytes(10).toString("hex"),
            }
        );

        const file = await File.findByIdAndUpdate(
            id,
            {
                $push: {
                    chunks: {
                        number: +chunk_number,
                        id: telegramRes.document.file_id,
                    },
                },
            },
            { new: true }
        );

        const fileLink = await bot.telegram.getFileLink(
            telegramRes.document.file_id
        );
        const file2 = await get(fileLink.toString(), { responseType: "blob" });

        const uint8Buffer = new Uint8Array(chunk.buffer);
        const uint8Data = new Uint8Array(Buffer.from(file2.data));
        const areEqual = (first: Uint8Array, second: Uint8Array) =>
            first.length === second.length &&
            first.every((value, index) => value === second[index]);
        console.log("Moment of truth: ", areEqual(uint8Buffer, uint8Data), { uint8Buffer, uint8Data });

        if (!file) return res.status(404).json({ error: "File not found" });
        return res.status(200).json({ file });
    } catch ({ message }) {
        console.log(message);
    };
};

export default storeChunk;