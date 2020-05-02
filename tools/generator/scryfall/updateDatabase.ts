import { connect, disconnect } from '@tuktuk-scg-scrapper/database/connect';
import { Card } from '../../../packages/database/schemas/card';

const { Transform } = require('stream');

export const createDatabaseStream = async () => {
    await connect();

    return new Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        autoDestroy: true,
        write: async function(chunk, encoding, callback) {
            try {
                const card = chunk.value;
                await Card.findOneAndUpdate({ id: card.id }, card, { upsert: true });
            } catch (e) {
                console.error('Failed to update', e);
            }finally {
                this.push(chunk);
                callback();
            }
        },
        final: async callback => {
            await disconnect();
            callback();
        },
    });
};
