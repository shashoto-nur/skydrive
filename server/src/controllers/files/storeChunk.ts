import crypto from "crypto";
import express from "express";

import File from "../../models/File";
import served from "../../server";

const storeChunk = async (req: express.Request, res: express.Response) => {
    try {
        const { bot } = served;
        const { id, chunk_number }: { id: string; chunk_number: string } =
            req.body;

        const chunk = (req.files as Express.Multer.File[])[0];
        const clientDataBuffer = chunk.buffer;
        const supportedBuffer = Buffer.from(
            clientDataBuffer.toString("base64")
        );

        const {
            document: { file_id },
        } = await bot.telegram.sendDocument(process.env.CHAT_ID!, {
            source: supportedBuffer,
            filename: crypto.randomBytes(10).toString("hex"),
        });

        const file = await File.findByIdAndUpdate(
            id,
            {
                $push: {
                    chunks: {
                        number: +chunk_number,
                        id: file_id,
                    },
                },
            },
            { new: true }
        );

        if (!file) return res.status(404).json({ error: "File not found" });
        return res.send({ status: "Uploaded" });
    } catch ({ message }) {
        console.log(message);
    }
};

export default storeChunk;
