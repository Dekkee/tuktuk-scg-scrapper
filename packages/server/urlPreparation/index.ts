export const prepareUrl = (input: string) => input
    // replace last space to +
    .replace(/\s+(\S+)$/g, '+$1')
    // hack: for some reason + before 'Will' breaks search query
    .replace(/\+(will)/gi, ' $1');

// old algorithm
// bad symbols
// .replace(/[\/\\,\.]/g, '')
// // the-of-etc
// .replace(/(?:(\s)(?:the|of|a|to|for))+(\s)/gi, '$1$2')
// .replace(/^(?:the|of|a|to|for)(\s)/gi, '')
// space into +
// .replace(/\s+/g, '+');
