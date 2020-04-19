import * as AWS from "aws-sdk";
import * as fs from 'fs';

export const uploadToS3 = async () => {
  const cred = new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
  const s3 = new AWS.S3({
    credentials: cred
  });
  await s3.upload({
    Body: fs.readFileSync('./generated/index/index.json'),
    Key: 'tuktuk/index.json',
    Bucket: 'dekkee',
  }).promise();
};
