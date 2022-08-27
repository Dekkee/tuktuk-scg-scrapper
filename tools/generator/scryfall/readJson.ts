import * as fs from "fs";

export const readJson = async (path) => {
    const stat = fs.statSync(path);
    const stream = fs.createReadStream(path);

    return {
        stream: stream,
        total: stat.size,
    }
};
