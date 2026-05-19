import { generate } from './generate';

module.exports.updater = async function () {
    await generate({ cloud: true, upload: true });
    console.log('Index ready');
};
