import axios from "axios";

type IResponse = {
    data: string;
}

const downloadChunk = async (fileNums: [number]) => {
    const responses: IResponse[] = await axios.all(
        fileNums.map((fileNum: number) =>
            axios.get(process.env.FILE_LINK! + fileNum)
        )
    );

    const b64Buf = Buffer.from(
        responses.reduce((acc, curr) => {
            return acc + curr.data;
        }, ""),
        "base64"
    );

    return b64Buf;
};

export default downloadChunk;
