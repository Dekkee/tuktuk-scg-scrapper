import * as fs from "fs";

const initMap = (map, values) => {
    const keys = {};
    values.forEach((v) => {
        Object.keys(v).forEach((vk: string) => {
            if (!(vk in keys)) {
                keys[vk] = 1;
            } else {
                keys[vk]++;
            }
        });
    });
    const max = Math.max(...Object.values(keys) as number[]);
    Object.entries(keys).forEach(([key, value]) => {
        map[key] = {
            required: value === max,
        };
    });
};

const fillMapWithTypes = (map, entries, objectsMap) => {
    const pushToObjects = (key, value) => {
        if (!(key in objectsMap)) {
            objectsMap[key] = [];
        }
        objectsMap[key].push(value);
    };

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
                        pushToObjects(key, value[0]);
                    } else {
                        map[key].type.add(`array(${valueType})`);
                    }
                }
            } else {
                map[key].type.add(`object(${key})`);
                pushToObjects(key, value);
            }
        }
    );
};

export const generateJson = (filename, values) => {
    console.log(`parsing ${filename}`);
    const mapTypes = {};

    initMap(mapTypes, values);

    const objectsMap = {};

    values.forEach(v => {
        fillMapWithTypes(mapTypes, Object.entries(v), objectsMap);
    });

    Object.entries(objectsMap).forEach(([key, value]) => {
        generateJson(key, value);
    });

    Object.entries(mapTypes).forEach(([k, v]: any[]) => {
        const values = [...v.type.values()];
        v.type = values.length > 1 ? values : values[0];
    });

    fs.writeFileSync(`./generated/schema/${filename}.json`, JSON.stringify(mapTypes));
};
