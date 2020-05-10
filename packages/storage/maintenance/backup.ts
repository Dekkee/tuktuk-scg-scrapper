import { mongoDb } from "@tuktuk-scg-scrapper/common/config/mongo";

const fs = require('fs');
const exec = require('child_process').exec;
const path = require('path');

// Concatenate root directory path with our backup folder.
const backupDirPath = path.join(__dirname, 'data', 'database-backup');

const dbOptions = {
  user: mongoDb.user,
  pass: mongoDb.password,
  host: mongoDb.host,
  port: mongoDb.port,
  database: mongoDb.dbName,
  autoBackup: true,
  removeOldBackup: true,
  keepLastDaysBackup: 2,
  autoBackupPath: backupDirPath
};

// return stringDate as a date object.
const stringToDate = dateString => {
  return new Date(dateString);
};

// Check if variable is empty or not.
const empty = mixedVar => {
  let undef, key, i, len;
  const emptyValues = [undef, null, false, 0, '', '0'];
  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedVar === emptyValues[i]) {
      return true;
    }
  }
  if (typeof mixedVar === 'object') {
    for (key in mixedVar) {
      return false;
    }
    return true;
  }
  return false;
};

// https://levelup.gitconnected.com/how-to-set-up-scheduled-mongodb-backups-with-a-bit-of-node-js-b81abebfa20
// Auto backup function
export const dbAutoBackUp = () => {
  console.info('Backing up mongo')
  // check for auto backup is enabled or disabled
  if (dbOptions.autoBackup == true) {
    let date = new Date();
    let beforeDate, oldBackupDir, oldBackupPath;

    // Current date
    const currentDate = stringToDate(date);
    let newBackupDir =
      currentDate.getFullYear() +
      '-' +
      (currentDate.getMonth() + 1) +
      '-' +
      currentDate.getDate();

    // New backup path for current backup process
    let newBackupPath = dbOptions.autoBackupPath + '-mongodump-' + newBackupDir;
    // check for remove old backup after keeping # of days given in configuration
    if (dbOptions.removeOldBackup == true) {
      beforeDate = new Date(currentDate);
      // Substract number of days to keep backup and remove old backup
      beforeDate.setDate(beforeDate.getDate() - dbOptions.keepLastDaysBackup);
      oldBackupDir =
        beforeDate.getFullYear() +
        '-' +
        (beforeDate.getMonth() + 1) +
        '-' +
        beforeDate.getDate();
      // old backup(after keeping # of days)
      oldBackupPath = dbOptions.autoBackupPath + 'mongodump-' + oldBackupDir;
    }

    // Command for mongodb dump process
    let cmd = `mongodump \\
    --host ${dbOptions.host} \\
    --port ${dbOptions.port} \\
    --db ${dbOptions.database} \\
    --collection ${dbOptions.database} \\
    --username ${dbOptions.user} \\
    --password ${dbOptions.pass} \\
    --out ${newBackupPath} \\
    --gzip`;

    exec(cmd, (error, stdout, stderr) => {
      if (empty(error)) {
        // check for remove old backup after keeping # of days given in configuration.
        if (dbOptions.removeOldBackup == true) {
          if (fs.existsSync(oldBackupPath)) {
            exec('rm -rf ' + oldBackupPath, err => {});
          }
        }
      }
    });
  }
};
