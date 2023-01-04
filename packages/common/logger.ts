const prefix = '[SERVER]';

export const logError = (message: string, err: Error) => {
    const stack = !!err.stack ? ` [STACK] ${err.stack}` : '';
    const details = !!message ? `[DETAILS] ${err.message}` : '';
    console.error(`${prefix} [MESSAGE] ${message || err.message}${details}${stack}`.replace(/\n/gm, "\\n"))
};
