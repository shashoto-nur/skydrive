import axios from 'axios';
import { inflateSync } from 'zlib';

type IResponse = {
    data: string;
};

const downloadChunk = async (fileNums: [number]) => {
    try {
        const responses: IResponse[] = await axios.all(
            fileNums.map((fileNum: number) =>
                axios.get(process.env.FILE_LINK! + fileNum)
            )
        );

        const b64Buf = Buffer.from(
            responses.reduce((acc, curr) => {
                return acc + curr.data;
            }, ''),
            'base64'
        );

        return b64Buf;
    } catch ({ message }) {
        console.log(message);
        return -1;
    }
};

export default downloadChunk;
