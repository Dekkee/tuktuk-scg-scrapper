import { describe, expect, it } from 'vitest';
import FlexSearchDefault from 'flexsearch';

const FlexSearch: any = FlexSearchDefault;

// Миррорит реальный флоу: generator (tools/generator/scryfall/generateIndex.ts)
// строит Document-индекс и export'ит его в JSON, сервер (suggest/flexSearch)
// import'ит и ищет. Ломается при несовместимом бампе flexsearch.

const generatorConfig = {
    split: /\s+| % /,
    preset: 'score',
    tokenize: 'forward',
    doc: {
        id: 'id',
        index: ['search'],
        store: ['en', 'ru', 'text'],
    },
};

const consumerConfig = {
    split: /\s+| % /,
    doc: {
        id: 'id',
        index: ['search'],
        store: ['en', 'ru', 'text'],
    },
};

const cards = [
    {
        id: 0,
        search: 'Шоковая молния % Lightning Bolt',
        text: 'Lightning Bolt deals 3 damage to any target.',
        en: { name: 'Lightning Bolt', scryfallId: 'aaa' },
        ru: { name: 'Шоковая молния', scryfallId: 'bbb' },
    },
    {
        id: 1,
        search: 'Mirri the Cursed',
        text: 'Flying, first strike, haste',
        en: { name: 'Mirri the Cursed', scryfallId: 'ccc' },
        ru: {},
    },
];

const buildAndExport = async () => {
    const index = new FlexSearch.Document(generatorConfig);
    cards.forEach((c) => index.add(c));

    const storage: Record<string, unknown> = {};
    // 0.8: export может быть async — дожидаемся промиса, не полагаясь на порядок ключей
    await index.export((key: string, value: unknown) => {
        storage[key] = value;
    });
    return JSON.parse(JSON.stringify(storage));
};

const importIndex = async (storage: Record<string, unknown>) => {
    const index = new FlexSearch.Document(consumerConfig);
    for (const [key, value] of Object.entries(storage)) {
        await index.import(key, value);
    }
    return index;
};

describe('flexsearch export/import roundtrip (generator -> suggest)', () => {
    it('finds a card by english name prefix with enriched store', async () => {
        const index = await importIndex(await buildAndExport());
        const res = index.search({ enrich: true, query: 'lightning', field: 'search', limit: 20 });
        const hits = res.flatMap(({ result }: any) => result);
        expect(hits.length).toBeGreaterThan(0);
        expect(hits[0].doc.en.name).toBe('Lightning Bolt');
        expect(hits[0].doc.ru.name).toBe('Шоковая молния');
        expect(hits[0].doc.text).toContain('damage');
    });

    it('finds a card by russian name', async () => {
        const index = await importIndex(await buildAndExport());
        const res = index.search({ enrich: true, query: 'шоковая', field: 'search', limit: 20 });
        const hits = res.flatMap(({ result }: any) => result);
        expect(hits.length).toBeGreaterThan(0);
        expect(hits[0].doc.en.name).toBe('Lightning Bolt');
    });

    it('forward tokenization matches partial word', async () => {
        const index = await importIndex(await buildAndExport());
        const res = index.search({ enrich: true, query: 'mir', field: 'search', limit: 20 });
        const hits = res.flatMap(({ result }: any) => result);
        expect(hits.some((h: any) => h.doc.en.name === 'Mirri the Cursed')).toBe(true);
    });

    it('search shape matches suggest() expectations: [{result: [{doc}]}]', async () => {
        const index = await importIndex(await buildAndExport());
        const res = index.search({ enrich: true, query: 'bolt', field: 'search', limit: 20 });
        expect(Array.isArray(res)).toBe(true);
        expect(res[0]).toHaveProperty('result');
        expect(res[0].result[0]).toHaveProperty('doc');
    });
});
