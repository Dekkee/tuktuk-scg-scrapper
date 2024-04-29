const prefix = '[SERVER]';

const buildMessage = (message: string, err?: Error) => {
    const stack = !!err.stack ? ` [STACK] ${err.stack}` : '';
    const details = !!message ? `[DETAILS] ${err.message}` : '';
    return `${prefix} [MESSAGE] ${message || err.message}${details}${stack}`.replace(/\n/gm, "\\n");
};

export const logError = (message: string, err: Error) => {
    console.error(buildMessage(message, err))
};

export const logInfo = (message: string) => {
    console.info(buildMessage(message))
};
