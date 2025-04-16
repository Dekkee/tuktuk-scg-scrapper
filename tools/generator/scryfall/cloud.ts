import { generate } from './generate';

module.exports.updater = async function() {
    await generate({ upload: true });
    console.log('Index ready');
}
