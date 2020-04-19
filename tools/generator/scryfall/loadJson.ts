import axios from "axios";

export const loadJson = async () => {
    const { data, headers } = await axios({
        url: 'https://archive.scryfall.com/json/scryfall-all-cards.json',
        method: 'GET',
        responseType: 'stream',
    });

    return {
        stream: data,
        total: headers['content-length'],
    }
};
