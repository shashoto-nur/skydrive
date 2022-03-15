import crypto from 'crypto';

import File from '../../models/File';
import served from '../../server';

const sendDocument = async (buffer: Buffer) => {
    try {
        const { bot } = served;
        const {
            document: { file_id },
        } = await bot.telegram.sendDocument(process.env.CHAT_ID!, {
            source: buffer,
            filename: crypto.randomBytes(10).toString('hex'),
        });

        const fileLink = (await bot.telegram.getFileLink(file_id)).toString();
        if (!fileLink) return -1;

        const n = fileLink.lastIndexOf('/');
        const fileNum = +fileLink.substring(n + 6).toString();

        return fileNum;
    } catch ({ message }) {
        console.log(message);
        return -1;
    }
};

const divideBuffer = (array: Buffer, limit: number) =>
    Array.from(new Array(Math.ceil(array.length / limit)), (_, i) =>
        array.slice(i * limit, i * limit + limit)
    );

const storeChunk = async ({
    id,
    number,
    chunk,
    repeat,
    chunkArray,
}: {
    id: string;
    number: number;
    chunk: Buffer;
    repeat: boolean;
    chunkArray: [[number]];
}) => {
    try {
        const limit = 15 * 1024 * 1024;
        const slices = divideBuffer(chunk, limit);

        const getFileNum = slices.map(async (slice, index) => {
            return { num: await sendDocument(slice), index };
        });

        const fileNums: { num: number; index: number }[] = await Promise.all(
            getFileNum
        );

        let orderedNums: number[] = [];
        for (const fileNum of fileNums) {
            if (fileNum.num === -1) {
                console.log('Error: File not found');
                return 'Error while sending file';
            }
            orderedNums[fileNum.index] = fileNum.num;
        }

        const emptyElement = undefined as any;

        const file = await File.findByIdAndUpdate(
            id,
            {
                $push: {
                    chunks: {
                        $each: [orderedNums],
                        $position: number,
                    },
                },
                complete: !repeat && !chunkArray.includes(emptyElement),
            },
            { new: true }
        );

        if (!file) return 'File not found';
        const { chunks: updatedChunk } = file;
        return updatedChunk;
    } catch ({ message }) {
        console.log(message);
        return 'Error while sending file';
    }
};

export default storeChunk;
