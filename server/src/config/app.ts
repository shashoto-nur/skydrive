import express from 'express';
import cors from 'cors';
import multer from 'multer';

const initApp = () => {
    const app = express();
    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(cors());

    console.log(' Express handling the http server...');
    return app;
};

export default initApp;