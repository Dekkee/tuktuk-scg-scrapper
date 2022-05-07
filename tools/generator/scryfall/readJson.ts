import * as fs from "fs";

export const readJson = async () => {
    const path = './generated/index/index.json';
    // const path = './generated/slimIndex.json';
    const stat = fs.statSync(path);
    const stream = fs.createReadStream(path);

    return {
        stream: stream,
        total: stat.size,
    }
};
