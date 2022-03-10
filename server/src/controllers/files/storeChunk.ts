import crypto from "crypto";
import express from "express";

import File from "../../models/File";
import served from "../../server";

const sendDocument = async (buffer: Buffer) => {
    try {
        const { bot } = served;
        const {
            document: { file_id },
        } = await bot.telegram.sendDocument(process.env.CHAT_ID!, {
            source: buffer,
            filename: crypto.randomBytes(10).toString("hex"),
        });

        const fileLink = (await bot.telegram.getFileLink(file_id)).toString();
        if (!fileLink) return -1;

        const n = fileLink.lastIndexOf("/");
        const fileNum = +fileLink.substring(n + 6).toString();

        return fileNum;
    } catch ({ message }) {
        console.log(message);
        return -1;
    }
};

const storeChunk = async (req: express.Request, res: express.Response) => {
    try {
        const limit = 20 * 1024 * 1024;
        const { id, chunk_number }: { id: string; chunk_number: string } =
            req.body;

        const chunk = (req.files as Express.Multer.File[])[0];
        const clientDataBuffer = chunk.buffer;
        const b64Buf = Buffer.from(clientDataBuffer.toString("base64"));
        console.log(b64Buf.length / (60 * 1024 * 1024));

        const slice1 = b64Buf.slice(0, 1 * limit);
        const slice2 = b64Buf.slice(1 * limit, 2 * limit);
        const slice3 = b64Buf.slice(2 * limit, 3 * limit);
        const slices = [
            slice1,
            ...(slice2.length !== 0 ? slice2 : []),
            ...(slice3.length !== 0 ? slice3 : []),
        ];

        let fileNums: number[] = [];
        if (typeof slices[0] === "number") {
            const fileNum = await sendDocument(slices as unknown as Buffer);
            fileNums = [fileNum];
        } else {
            const getFileNum = slices.map(async (slice) => {
                return await sendDocument(slice as unknown as Buffer);
            });

            fileNums = await Promise.all(getFileNum);
        }

        if (fileNums.includes(-1)) {
            console.log("Error: File not found");
            return res.status(500).send("Error while sending file");
        }

        const file = await File.findByIdAndUpdate(
            id,
            {
                $push: {
                    chunks: [fileNums],
                },
            },
            { new: true }
        );

        if (!file) return res.status(404).json({ error: "File not found" });
        return res.send({ status: "Uploaded" });
    } catch ({ message }) {
        console.log(message);
        return res.status(500).send("Error while sending file");
    }
};

export default storeChunk;
