
import { connect } from 'mongoose';

const connectToDatabase = async () => {
    try {
        if(!process.env.MONGO_URI)
            console.log('\x1b[31m%s\x1b[0m', 'MONGO_URI not set!');
        else {
            const conn = await connect(process.env.MONGO_URI);
            console.log(` MongoDB Connected: ${ conn.connection.host }...`);
        };
    } catch ({ message }) {
        console.log(`Error: ${ message }`);
        process.exit(1);
    };
};

export default connectToDatabase;