import express from 'express';

const initApp = () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    console.log(' Express handling the http server...');
    return app;
};

export default initApp;