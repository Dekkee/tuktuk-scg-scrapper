import { describe, expect, it } from 'vitest';
import { Readable, pipeline as streamPipeline } from 'stream';
import { promisify } from 'util';
import { createIndexStream, IndexPayload } from './generateIndex';

const pipeline = promisify(streamPipeline);

const card = (over: Record<string, unknown>) => ({
    lang: 'en',
    layout: 'normal',
    set_type: 'core',
    border_color: 'black',
    oracle_text: 'Some text.',
    ...over,
});

// Регрессия DEK-37: flexsearch 0.8 убрал финальный ключ 'store' из export(),
// и завершение стрима по нему превращалось в вечный hang (таймаут Cloud Function).
// Тест гарантирует, что onReady вызывается и стрим финализируется.
describe('createIndexStream', () => {
    it('finalizes and delivers export payload via onReady', async () => {
        let payload: IndexPayload | undefined;
        const stream = createIndexStream({
            onReady: (p) => {
                payload = p;
            },
        });

        const source = Readable.from(
            [
                { value: card({ id: 'aaa', name: 'Lightning Bolt' }) },
                { value: card({ id: 'bbb', name: 'Mirri the Cursed' }) },
            ],
            { objectMode: true }
        );

        await pipeline(source, stream);

        expect(payload).toBeDefined();
        expect(Object.keys(payload!.index).length).toBeGreaterThan(0);
        expect(payload!.failed).toHaveLength(0);
    }, 15000);
});
