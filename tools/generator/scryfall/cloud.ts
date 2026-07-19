import { generate } from './generate';
import { uploadToS3 } from './uploadToS3';

// Диагностический режим (DEK-193): invoke с {"probe": true} гоняет два аплоада
// на тестовый ключ прямо из рантайма функции — маленький (single PUT) и 6МБ
// (multipart) — чтобы локализовать SignatureDoesNotMatch, не пересобирая индекс.
const probe = async () => {
    const report: Record<string, unknown> = {
        date: new Date().toISOString(),
        proxyEnv: Object.keys(process.env).filter((k) => /proxy/i.test(k)),
        awsEnv: Object.keys(process.env).filter((k) => k.startsWith('AWS_')),
        node: process.version,
    };
    try {
        await uploadToS3('{"probe":"small"}', { probe: 'small' }, 'index-ci-test.json');
        report.small = 'OK';
    } catch (e) {
        report.small = `FAIL: ${e?.name}: ${e?.message}`;
    }
    try {
        await uploadToS3('x'.repeat(6 * 1024 * 1024), { probe: 'multipart' }, 'index-ci-test.json');
        report.multipart = 'OK';
    } catch (e) {
        report.multipart = `FAIL: ${e?.name}: ${e?.message}`;
    }
    console.log(`PROBE ${JSON.stringify(report)}`);
    return report;
};

module.exports.updater = async function (event?: { probe?: boolean }) {
    if (event?.probe) {
        return await probe();
    }
    await generate({ cloud: true, upload: true });
    console.log('Index ready');
};
