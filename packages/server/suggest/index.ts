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
  return index
    .search(name, {
      field: "search",
      limit: 20
    })
    .reduce((accumulator, { card }, index) => {
      accumulator[index + 1] = card;
      !isRu && delete card.localizedName;
      return accumulator;
    }, {});
};
