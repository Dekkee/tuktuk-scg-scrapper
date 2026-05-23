import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export const uploadToS3 = async (body: Buffer | string) => {
    const s3 = new S3Client({
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        endpoint: 'https://storage.yandexcloud.net',
        region: 'ru-central1',
    });
    try {
        const upload = new Upload({
            client: s3,
            params: {
                Body: body,
                Key: 'index.json',
                Bucket: 'tuktuk',
                ACL: 'public-read',
            },
        });
        const data = await upload.done();
        console.log(`Uploading done: ${JSON.stringify(data)}`);
    } catch (e) {
        console.error(`Uploading failed: ${e}`);
    }
};
