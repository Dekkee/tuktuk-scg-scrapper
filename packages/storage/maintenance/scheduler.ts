import { dbAutoBackUp } from './backup';
const CronJob = require('cron').CronJob;

const cronJobs = [
    // AutoBackUp every week (at 00:00 on Sunday)
    new CronJob('0 20 4 * * *', dbAutoBackUp, null, true, 'Europe/Moscow'),
];

export const stopCronJobs = () => cronJobs.forEach((job) => job.stop());
