import * as AWS from 'aws-sdk';
import * as fs from 'fs';

export const uploadToS3 = async () => {
    const cred = new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
    const s3 = new AWS.S3({
        credentials: cred,
        endpoint: 'storage.yandexcloud.net',
    });
    try {
    const data = await s3
        .upload({
            Body: fs.readFileSync('./generated/index/index.json'),
            Key: 'index.json',
            Bucket: 'tuktuk',
            ACL: 'public-read',
        })
        .promise();

        console.log(`Uploading done: ${JSON.stringify(data)}`)
    } catch (e) {
        console.error(`Uploading failed: ${e}`)
    }
};
