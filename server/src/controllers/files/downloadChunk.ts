import get from 'axios';
import express from "express";
import served from "../../server";

const downloadChunk = async (req: express.Request, res: express.Response) => {
    const { bot } = served;
    const id = req.params.id;

    const fileLink = await bot.telegram.getFileLink(id);
    if(!fileLink) return res.status(404).send('File not found');

    res.setHeader('Content-Type', 'application/octet-stream');

    const file = await get(fileLink.toString(), { responseType: "blob" })
    if(!file.data) return res.status(404).send('File not found');

    const data = file.data;
    res.send(data);
};

export default downloadChunk;