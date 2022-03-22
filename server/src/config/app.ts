import path from 'path';
import express from 'express';
import cors from 'cors';

const initApp = () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(cors());

    const pathToBuild = '../../../client/build';
    app.use(express.static(path.resolve(__dirname, pathToBuild)));

    app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, pathToBuild, 'index.html'));
    });

    console.log(' Express handling the http server...');
    return app;
};

export default initApp;
