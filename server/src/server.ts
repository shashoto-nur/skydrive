import express from 'express';

const app = express();
const PORT = 5000;

app.get('/', (_, res) => res.send('Server is online'));
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));