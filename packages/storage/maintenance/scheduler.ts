import { dbAutoBackUp } from './backup';
import { CronJob } from 'cron';

const cronJobs = [
    // AutoBackUp every week (at 00:00 on Sunday)
    new CronJob('0 20 4 * * *', dbAutoBackUp, null, true, 'Europe/Moscow'),
];

console.info(`Maintenance: running ${cronJobs.length} jobs`);

export const stopCronJobs = () => cronJobs.forEach((job) => job.stop());
