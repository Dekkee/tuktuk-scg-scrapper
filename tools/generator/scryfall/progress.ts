import * as prettyBytes from "pretty-bytes";
import * as Progress from 'progress';

import readline = require('readline');

export const createProgressStream = (total: string | number) => {
  if (!total) {
    let currentBytes = 0;
    const prefix = 'Loaded: ';
    process.stdout.write(`${prefix}${currentBytes} B`);
    return chunk => {
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
    return chunk => {
      progressBar.tick(chunk.length);
      return chunk;
    }
  }
};
