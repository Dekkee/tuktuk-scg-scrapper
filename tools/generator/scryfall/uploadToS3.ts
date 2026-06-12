import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import axios from 'axios';

const BUCKET = 'tuktuk';
const KEY = 'index.json';
const PUBLIC_URL = `https://storage.yandexcloud.net/${BUCKET}/${KEY}`;
const WATERMARK_HEADER = 'x-amz-meta-scryfall-updated-at';

// Read the Scryfall updated_at we stamped onto the last uploaded index.json.
// index.json is public-read, so a plain HEAD needs no S3 credentials (the SA's
// storage.uploader role does not grant read). Missing object / header / network
// error => undefined, i.e. "unknown" => caller rebuilds.
export const getStoredUpdatedAt = async (): Promise<string | undefined> => {
    try {
        const { headers } = await axios.head(PUBLIC_URL);
        return headers[WATERMARK_HEADER] as string | undefined;
    } catch {
        return undefined;
    }
};

export const uploadToS3 = async (body: Buffer | string, metadata?: Record<string, string>) => {
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
                Key: KEY,
                Bucket: BUCKET,
                ACL: 'public-read',
                Metadata: metadata,
            },
        });
        const data = await upload.done();
        console.log(`Uploading done: ${JSON.stringify(data)}`);
    } catch (e) {
        // Rethrow so a failed upload fails the function invocation instead of
        // silently "succeeding" and letting index.json go stale unnoticed. The
        // watermark is only stamped on a successful PutObject, so the next run
        // re-detects the mismatch and retries.
        console.error(`Uploading failed: ${e}`);
        throw e;
    }
};
