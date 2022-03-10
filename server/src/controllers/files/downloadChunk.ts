import axios from "axios";
import express from "express";

const downloadChunk = async (req: express.Request, res: express.Response) => {
    const { id } = req.params;

    const [res1, res2] = await axios.all([
        axios.get(`https://api-1`),
        axios.get(`https://api-2`),
    ]);
    const file = await axios.get(process.env.FILE_LINK! + id, { responseType: "blob" });
    if (!file.data) return res.status(404).send("File not found");

    const storage64StrData: string = file.data;
    const storageDataBuffer = Buffer.from(storage64StrData, "base64");
    
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(storageDataBuffer);
};

export default downloadChunk;
