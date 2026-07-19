import { getIndex, shouldUpdateIndex } from './flexSearch';
import { logError } from '@tuktuk-scg-scrapper/common/logger';

let index;

// Инициализация не должна ронять процесс: несовместимый/битый индекс в S3
// (например, экспорт другой major-версии flexsearch) деградирует suggest до
// пустого ответа, а интервальный цикл ниже ретраит импорт до успеха.
const initIndex = async () => {
    try {
        index = await getIndex();
    } catch (e) {
        logError('Failed to build suggest index, suggest is degraded until next retry', e);
    }
};
initIndex();

setInterval(
    async () => {
        try {
            if (await shouldUpdateIndex()) {
                console.log('Index update detected');
                index = await getIndex();
            } else if (!index) {
                await initIndex();
            }
        } catch (e) {
            logError('Failed to refresh suggest index', e);
        }
    },
    10 * 60 * 1000
);

export const suggest = (name: string) => {
    if (!index) {
        return null;
    }

    const isRu = /[а-яА-ЯЁё]/.test(name);
    const firstLang = isRu ? 'ru' : 'en';
    const secondLang = !isRu ? 'ru' : 'en';

    const c = index.search({ enrich: true, query: name, field: 'search', limit: 20 });
    let map = {};

    c.forEach(({ result }) => {
        result.reduce((accumulator, { doc }, index) => {
            accumulator[index + 1] = {
                ...doc[secondLang],
                ...doc[firstLang],
                text: doc.text,
            };
            if (doc['en'].name) {
                accumulator[index + 1].name = doc['en'].name;
            }
            if (doc['ru'].name) {
                accumulator[index + 1].localizedName = doc['ru'].name;
            }
            return accumulator;
        }, map);
    });

    return map;
};
