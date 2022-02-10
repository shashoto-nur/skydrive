import { CronJob } from 'cron';

const startCron = () => {
    new CronJob('0 0 0 * * *', function() {
        console.log("Runs every day at 12:00 AM");
    }, null, true, 'America/Los_Angeles');

    console.log(' Cron jobs are initiated...');
}

export default startCron;