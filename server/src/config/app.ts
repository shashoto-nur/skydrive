import express from 'express';

const initApp = () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    console.log(' Express app initialised!');
    return app;
};

export default initApp;