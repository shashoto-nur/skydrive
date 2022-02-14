import User from '../models/User';
import { CronJob } from 'cron';

const startCron = () => {
    new CronJob('0 0 0 * * *', function() {
        console.log("Deleting unverified users at Bangladesh time 12:00am");
        User.deleteMany({ verified: false }, (err: Error, res: string) => {
            if(err) console.log("Failed: ", err);
            else console.log("Successful: ", res);
        });
    }, null, true, 'America/Los_Angeles');

    console.log(' Cron jobs are initiated...');
};

export default startCron;