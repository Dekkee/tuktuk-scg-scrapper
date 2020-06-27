import * as fs from 'fs';

const { Transform } = require('stream');

export const createSchemaStream = initFilename => {
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
        if(!countsMap[filename]) {
            countsMap[filename] = {};
        }

        if(!globalMap[filename]) {
            globalMap[filename] = {};
        }

        const currentKeys = countsMap[filename];
        const mapTypes = globalMap[filename];

        if (chunk) {
            Object.keys(chunk).forEach((vk: string) => {
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
        write: function(chunk, encoding, callback) {
            generateSchema(initFilename, chunk.value);
            this.push(chunk);
            callback();
        },
        final: (callback) => {
            const files = Object.keys(globalMap);
            files.forEach((f) => {
                const max = Math.max(...(Object.values(countsMap[f]) as number[]));
                Object.entries(countsMap[f]).forEach(([key, value]) => {
                    globalMap[f][key].required = value === max;
                });

                Object.entries(globalMap[f]).forEach(([k, v]: any[]) => {
                    const values = [...v.type.values()];
                    v.type = values.length > 1 ? values : values[0];
                });

                fs.writeFileSync(`./generated/schema/${f}.json`, JSON.stringify(globalMap[f], null, '\t'));
            });
            callback();
        },
    });
};
