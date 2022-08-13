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

  const c = index.search({ enrich: true, query: name, field: 'search', limit: 20 });
  let map = {};

  c.forEach(({ result }) => {
    result.reduce((accumulator, { doc }, index) => {
      const { card } = doc;
      accumulator[index + 1] = card;
      return accumulator;
    }, map);
  })

  return map;
};
