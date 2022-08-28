import { getIndex, shouldUpdateIndex } from "./flexSearch";

let index;
getIndex().then(i => (index = i));

setInterval(async () => {
  if (await shouldUpdateIndex()) {
    console.log('Index update detected');
    index = await getIndex();
  }
}, 10 * 60 * 1000);

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
      console.log('===', doc);
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
  })

  return map;
};
