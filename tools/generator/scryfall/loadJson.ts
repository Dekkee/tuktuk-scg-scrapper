import axios from "axios";

export const loadJson = async () => {
    const { data: bulk } = await axios({
        url: 'https://api.scryfall.com/bulk-data',
        method: 'get',
    })

    const { download_uri: allCardsUrl, compressed_size } = bulk.data.find(({ type }) => type === 'all_cards');

    const { data, headers } = await axios({
        url: allCardsUrl,
        method: 'GET',
        responseType: 'stream',
    });

    return {
        stream: data,
        total: headers['content-length'], // || compressed_size,
    }
};
