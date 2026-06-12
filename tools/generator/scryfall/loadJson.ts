import axios from "axios";

export interface BulkInfo {
    // Scryfall regenerates the bulk file periodically; updated_at changes only
    // when it actually does, so it doubles as the index's freshness watermark.
    updatedAt: string;
    downloadUri: string;
    size: number;
}

export const getBulkInfo = async (): Promise<BulkInfo> => {
    const { data: bulk } = await axios({
        url: 'https://api.scryfall.com/bulk-data',
        method: 'get',
    });

    const allCards = bulk.data.find(({ type }) => type === 'all_cards');

    return {
        updatedAt: allCards.updated_at,
        downloadUri: allCards.download_uri,
        size: allCards.size,
    };
};

export const loadJson = async (info?: BulkInfo) => {
    const { downloadUri, size } = info ?? (await getBulkInfo());

    const { data, headers } = await axios({
        url: downloadUri,
        method: 'GET',
        responseType: 'stream',
    });

    return {
        stream: data,
        total: (headers['content-length'] as string | number) ?? size,
    }
};
