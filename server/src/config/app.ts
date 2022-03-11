import express from 'express';
import cors from 'cors';

const initApp = () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(cors());

    console.log(' Express handling the http server...');
    return app;
};

export default initApp;