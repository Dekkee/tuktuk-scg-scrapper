System.register('loadJson', ['axios'], function (exports_1, context_1) {
    'use strict';
    var axios_1, loadJson;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (axios_1_1) {
                axios_1 = axios_1_1;
            },
        ],
        execute: function () {
            exports_1(
                'loadJson',
                (loadJson = async () => {
                    const { data: bulk } = await axios_1.default({
                        url: 'https://api.scryfall.com/bulk-data',
                        method: 'get',
                    });
                    const { download_uri: allCardsUrl, compressed_size } = bulk.data.find(
                        ({ type }) => type === 'all_cards'
                    );
                    const { data, headers } = await axios_1.default({
                        url: allCardsUrl,
                        method: 'GET',
                        responseType: 'stream',
                    });
                    return {
                        stream: data,
                        total: headers['content-length'], // || compressed_size,
                    };
                })
            );
        },
    };
});
System.register('progress', ['pretty-bytes', 'progress', 'readline'], function (exports_2, context_2) {
    'use strict';
    var prettyBytes, Progress, readline, createProgressStream;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (prettyBytes_1) {
                prettyBytes = prettyBytes_1;
            },
            function (Progress_1) {
                Progress = Progress_1;
            },
            function (readline_1) {
                readline = readline_1;
            },
        ],
        execute: function () {
            exports_2(
                'createProgressStream',
                (createProgressStream = (total) => {
                    if (!total) {
                        let currentBytes = 0;
                        const prefix = 'Loaded: ';
                        process.stdout.write(`${prefix}${currentBytes} B`);
                        return (chunk) => {
                            currentBytes += chunk.length;
                            readline.cursorTo(process.stdout, prefix.length);
                            readline.clearLine(process.stdout, 1);
                            process.stdout.write(`${prettyBytes(currentBytes)}`);
                            return chunk;
                        };
                    } else {
                        const progressBar = new Progress('-> reading [:bar] :percent :etas', {
                            width: 40,
                            complete: '=',
                            incomplete: ' ',
                            renderThrottle: 1,
                            total: parseInt(String(total), 10),
                        });
                        return (chunk) => {
                            progressBar.tick(chunk.length);
                            return chunk;
                        };
                    }
                })
            );
        },
    };
});
System.register('generateSchema', ['fs'], function (exports_3, context_3) {
    'use strict';
    var fs, Transform, createSchemaStream;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (fs_1) {
                fs = fs_1;
            },
        ],
        execute: function () {
            Transform = require('stream').Transform;
            exports_3(
                'createSchemaStream',
                (createSchemaStream = (initFilename) => {
                    if (!fs.existsSync('./generated/schema')) {
                        fs.mkdirSync('./generated/schema');
                    }
                    const globalMap = {};
                    const countsMap = {};
                    const fillMapWithTypes = (map, entries) => {
                        entries.forEach(([key, value]) => {
                            if (!('type' in map[key])) {
                                map[key].type = new Set();
                            }
                            if (typeof value === 'string') {
                                map[key].type.add('string');
                            } else if (typeof value === 'number') {
                                map[key].type.add('number');
                            } else if (typeof value === 'boolean') {
                                map[key].type.add('boolean');
                            } else if (Array.isArray(value)) {
                                if (value.length > 0) {
                                    const valueType = typeof value[0];
                                    if (valueType === 'object') {
                                        map[key].type.add(`array(${key})`);
                                        generateSchema(key, value[0]);
                                    } else {
                                        map[key].type.add(`array(${valueType})`);
                                    }
                                } else {
                                    map[key].type.add(`array(string)`);
                                }
                            } else {
                                map[key].type.add(`object(${key})`);
                                generateSchema(key, value);
                            }
                        });
                    };
                    const generateSchema = (filename, chunk) => {
                        if (!countsMap[filename]) {
                            countsMap[filename] = {};
                        }
                        if (!globalMap[filename]) {
                            globalMap[filename] = {};
                        }
                        const currentKeys = countsMap[filename];
                        const mapTypes = globalMap[filename];
                        if (chunk) {
                            Object.keys(chunk).forEach((vk) => {
                                if (!(vk in mapTypes)) {
                                    mapTypes[vk] = {};
                                }
                                if (!(vk in currentKeys)) {
                                    currentKeys[vk] = 1;
                                } else {
                                    currentKeys[vk]++;
                                }
                            });
                            fillMapWithTypes(mapTypes, Object.entries(chunk));
                        }
                    };
                    return new Transform({
                        writableObjectMode: true,
                        readableObjectMode: true,
                        autoDestroy: true,
                        write: function (chunk, encoding, callback) {
                            generateSchema(initFilename, chunk.value);
                            this.push(chunk);
                            callback();
                        },
                        final: (callback) => {
                            const files = Object.keys(globalMap);
                            files.forEach((f) => {
                                const max = Math.max(...Object.values(countsMap[f]));
                                Object.entries(countsMap[f]).forEach(([key, value]) => {
                                    globalMap[f][key].required = value === max;
                                });
                                Object.entries(globalMap[f]).forEach(([k, v]) => {
                                    const values = [...v.type.values()];
                                    v.type = values.length > 1 ? values : values[0];
                                });
                                fs.writeFileSync(
                                    `./generated/schema/${f}.json`,
                                    JSON.stringify(globalMap[f], null, '\t')
                                );
                            });
                            callback();
                        },
                    });
                })
            );
        },
    };
});
System.register('generateTypings', ['fs'], function (exports_4, context_4) {
    'use strict';
    var fs, extractRe, toPascalCase, primitives, generateTypings;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (fs_2) {
                fs = fs_2;
            },
        ],
        execute: function () {
            if (!fs.existsSync('./generated/typing')) {
                fs.mkdirSync('./generated/typing', { recursive: true });
            }
            extractRe = /\((\w+)\)$/;
            toPascalCase = (camelCaseString) => `${camelCaseString[0].toUpperCase()}${camelCaseString.slice(1)}`;
            primitives = new Set(['string', 'number', 'boolean']);
            exports_4(
                'generateTypings',
                (generateTypings = async () => {
                    const schemas = fs.readdirSync('./generated/schema');
                    const availableTypes = new Set();
                    schemas.forEach((schema) => {
                        const [, name] = schema.match(/(\w+)\.json/);
                        availableTypes.add(name);
                    });
                    const typedSchemas = [];
                    availableTypes.forEach((schema) => {
                        const content = JSON.parse(fs.readFileSync(`./generated/schema/${schema}.json`).toString());
                        const ts = Object.entries(content).map(([key, value]) => {
                            let calculatedType = value.type;
                            if (value.type.includes('array')) {
                                const [, extracted] = value.type.match(extractRe) || [];
                                calculatedType = `${primitives.has(extracted) ? extracted : toPascalCase(extracted)}[]`;
                            }
                            if (value.type.includes('object')) {
                                const [, extracted] = value.type.match(extractRe) || [];
                                calculatedType = toPascalCase(extracted);
                            }
                            return `\t${key}${value.required ? '' : '?'}: ${calculatedType},\n`;
                        });
                        typedSchemas.push(`export type ${toPascalCase(schema)} = {\n${ts.join('')}}\n`);
                    });
                    fs.writeFileSync('./generated/typing/index.d.ts', typedSchemas.join('\n'));
                })
            );
        },
    };
});
System.register('uploadToS3', ['aws-sdk', 'fs'], function (exports_5, context_5) {
    'use strict';
    var AWS, fs, uploadToS3;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (AWS_1) {
                AWS = AWS_1;
            },
            function (fs_3) {
                fs = fs_3;
            },
        ],
        execute: function () {
            exports_5(
                'uploadToS3',
                (uploadToS3 = async () => {
                    const cred = new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
                    const s3 = new AWS.S3({
                        credentials: cred,
                        endpoint: 'storage.yandexcloud.net',
                    });
                    try {
                        const data = await s3
                            .upload({
                                Body: fs.readFileSync('./generated/index/index.json'),
                                Key: 'index.json',
                                Bucket: 'tuktuk',
                                ACL: 'public-read',
                            })
                            .promise();
                        console.log(`Uploading done: ${JSON.stringify(data)}`);
                    } catch (e) {
                        console.error(`Uploading failed: ${e}`);
                    }
                })
            );
        },
    };
});
System.register('generateIndex', ['fs'], function (exports_6, context_6) {
    'use strict';
    var fs,
        Writable,
        FlexSearch,
        index,
        path,
        filteredLayouts,
        filteredSetTypes,
        filteredCards,
        failedCards,
        i,
        createIndexStream;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (fs_4) {
                fs = fs_4;
            },
        ],
        execute: function () {
            Writable = require('stream').Writable;
            FlexSearch = require('flexsearch');
            index = new FlexSearch.Document({
                split: /\s+| % /,
                preset: 'score',
                tokenize: 'forward',
                doc: {
                    id: 'id',
                    index: ['search'],
                    store: ['en', 'ru', 'text'],
                },
            });
            path = './generated/index';
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
            filteredLayouts = new Set(['art_series', 'emblem', 'token']);
            filteredSetTypes = new Set(['slu', 'promo']);
            filteredCards = [];
            failedCards = [];
            i = 0;
            exports_6(
                'createIndexStream',
                (createIndexStream = () => {
                    const map = {};
                    const parseCard = (card) => {
                        var _a;
                        i++;
                        try {
                            if (
                                filteredLayouts.has(card.layout) ||
                                card.digital ||
                                filteredSetTypes.has(card.set_type) ||
                                (card.border_color === 'borderless' &&
                                    ((_a = map[card.name]) === null || _a === void 0 ? void 0 : _a[card.lang]))
                            ) {
                                filteredCards.push(card);
                                return;
                            }
                            const isRu = card.lang === 'ru';
                            const isEn = card.lang === 'en';
                            if (isRu || isEn) {
                                // if (card.name.includes('Myrel') && card.set != 'slu') {
                                //     console.log(`==========`);
                                //     console.log(card.lang);
                                //     console.log(card.set);
                                //     console.log(card.name);
                                //     console.log(card.printed_name);
                                //     console.log(card.card_faces?.map(({ printed_name, name }) => `${printed_name} || ${name}`));
                                //     console.log(card.border_color);
                                // }
                                if (!(card.name in map)) {
                                    map[card.name] = {
                                        names: new Set(),
                                    };
                                }
                                if (Array.isArray(card.card_faces)) {
                                    map[card.name][card.lang] = map[card.name][card.lang] || {};
                                    map[card.name].text = '';
                                    map[card.name][card.lang].scryfallId = card.id;
                                    const faces = [];
                                    card.card_faces.forEach((face) => {
                                        map[card.name].names.add(face.printed_name || face.name);
                                        map[card.name].text += `${face.oracle_text} `;
                                        faces.push(face.printed_name || face.name);
                                    });
                                    if (faces.length) {
                                        map[card.name][card.lang].name = faces.join(' // ');
                                    }
                                } else {
                                    map[card.name].names.add(card.printed_name || card.name);
                                    map[card.name].text = card.oracle_text;
                                    map[card.name][card.lang] = {
                                        ...map[card.name][card.lang],
                                        name: card.printed_name || card.name,
                                        scryfallId: card.id,
                                    };
                                }
                                // if (card.name.includes('Myrel') && card.set != 'slu') {
                                //     console.log('===', map[card.name])
                                // }
                            }
                        } catch (e) {
                            console.error(e);
                            failedCards.push({ card, error: e });
                        }
                    };
                    return new Writable({
                        objectMode: true,
                        autoDestroy: true,
                        write: function (chunk, encoding, callback) {
                            parseCard(chunk.value);
                            callback();
                        },
                        final: (callback) => {
                            let id = 0;
                            Object.entries(map).forEach(([key, value]) => {
                                const c = {
                                    id: id++,
                                    search: `${[...value.names.values()].filter(Boolean).reverse().join(' % ')}`,
                                    text: value.text,
                                    en: {},
                                    ru: {},
                                };
                                let variant = value.en;
                                if (variant) {
                                    c.en = {
                                        name: variant.name,
                                        scryfallId: variant.scryfallId,
                                    };
                                    variant = null;
                                }
                                variant = value.ru;
                                if (variant) {
                                    c.ru = {
                                        name: variant.name,
                                        scryfallId: variant.scryfallId,
                                    };
                                    variant = null;
                                }
                                index.add(c);
                            });
                            console.log(`Cards parsed: ${i}`);
                            console.log(`Cards in index: ${id}`);
                            console.log(`Cards filtered: ${filteredCards.length}`);
                            console.log(`Cards failed: ${failedCards.length}`);
                            const storage = {};
                            return new Promise((resolve) => {
                                index.export((key, value) => {
                                    storage[key] = value;
                                    if (key === 'store') {
                                        console.log('Save index');
                                        try {
                                            fs.writeFileSync(`${path}/index.json`, JSON.stringify(storage));
                                            fs.writeFileSync(`${path}/filtered.json`, JSON.stringify(filteredCards));
                                            fs.writeFileSync(`${path}/failed.json`, JSON.stringify(failedCards));
                                        } catch (e) {
                                            console.error(e);
                                        } finally {
                                            resolve();
                                        }
                                    }
                                });
                            }).then(callback);
                        },
                    });
                })
            );
        },
    };
});
System.register('readJson', ['fs'], function (exports_7, context_7) {
    'use strict';
    var fs, readJson;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (fs_5) {
                fs = fs_5;
            },
        ],
        execute: function () {
            exports_7(
                'readJson',
                (readJson = async (path) => {
                    const stat = fs.statSync(path);
                    const stream = fs.createReadStream(path);
                    return {
                        stream: stream,
                        total: stat.size,
                    };
                })
            );
        },
    };
});
System.register(
    'generate',
    ['fs', 'loadJson', 'progress', 'generateSchema', 'generateTypings', 'uploadToS3', 'generateIndex', 'readJson'],
    function (exports_8, context_8) {
        'use strict';
        var fs,
            loadJson_1,
            progress_1,
            generateSchema_1,
            generateTypings_1,
            uploadToS3_1,
            generateIndex_1,
            readJson_1,
            PassThrough,
            chain,
            parser,
            streamArray,
            generate;
        var __moduleName = context_8 && context_8.id;
        return {
            setters: [
                function (fs_6) {
                    fs = fs_6;
                },
                function (loadJson_1_1) {
                    loadJson_1 = loadJson_1_1;
                },
                function (progress_1_1) {
                    progress_1 = progress_1_1;
                },
                function (generateSchema_1_1) {
                    generateSchema_1 = generateSchema_1_1;
                },
                function (generateTypings_1_1) {
                    generateTypings_1 = generateTypings_1_1;
                },
                function (uploadToS3_1_1) {
                    uploadToS3_1 = uploadToS3_1_1;
                },
                function (generateIndex_1_1) {
                    generateIndex_1 = generateIndex_1_1;
                },
                function (readJson_1_1) {
                    readJson_1 = readJson_1_1;
                },
            ],
            execute: function () {
                // import { createDatabaseStream } from './updateDatabase';
                PassThrough = require('stream').PassThrough;
                chain = require('stream-chain').chain;
                parser = require('stream-json').parser;
                streamArray = require('stream-json/streamers/StreamArray').streamArray;
                exports_8(
                    'generate',
                    (generate = (opts) => {
                        return new Promise(async (resolve, reject) => {
                            const shouldReadData = opts.slim || opts.local;
                            const shouldUpload = opts.upload;
                            const localPath = opts.slim ? './generated/data.json' : './generated/data.json';
                            const { stream: dataStream, total } = await (shouldReadData
                                ? readJson_1.readJson(localPath)
                                : loadJson_1.loadJson());
                            shouldReadData ? console.log(`Reading ${localPath}`) : console.log('Downloading');
                            const rawDataStream = new PassThrough({ allowHalfOpen: false, objectMode: true });
                            const parsedCardStream = new PassThrough({ allowHalfOpen: false, objectMode: true });
                            const pipeline = chain(
                                [
                                    dataStream,
                                    rawDataStream,
                                    progress_1.createProgressStream(total),
                                    parser(),
                                    streamArray(),
                                    generateSchema_1.createSchemaStream('card'),
                                    generateIndex_1.createIndexStream(),
                                    // argv.store && await createDatabaseStream(),
                                ].filter(Boolean)
                            );
                            if (!shouldReadData) {
                                console.log(`Writing index on disk: ${localPath}`);
                                rawDataStream.pipe(fs.createWriteStream(localPath));
                            }
                            pipeline.on('error', (e) => {
                                console.error(e);
                                reject(e);
                            });
                            pipeline.on('end', async () => {
                                console.log('Generate typings');
                                await generateTypings_1.generateTypings();
                                if (shouldUpload) {
                                    console.log('Uploading index to S3');
                                    await uploadToS3_1.uploadToS3();
                                    console.log('Success');
                                }
                                resolve();
                            });
                        });
                    })
                );
            },
        };
    }
);
System.register('cloud', ['generate'], function (exports_9, context_9) {
    'use strict';
    var generate_1;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (generate_1_1) {
                generate_1 = generate_1_1;
            },
        ],
        execute: function () {
            module.exports.updater = async function () {
                await generate_1.generate({ upload: true });
                console.log('Index ready');
            };
        },
    };
});
//# sourceMappingURL=cloud.js.map
