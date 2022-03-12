import { connect } from 'mongoose';

const connectToDatabase = async () => {
    try {
        if (!process.env.DB_URI)
            console.log('\x1b[31m%s\x1b[0m', 'DB_URI not set!');
        else {
            const conn = await connect(process.env.DB_URI);
            console.log(` Connected to database: ${conn.connection.host}...`);
        }
    } catch ({ message }) {
        console.log(`Error: ${message}`);
        process.exit(1);
    }
};

export default connectToDatabase;
