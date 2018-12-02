import { ScgResponce } from "../server/html-parser";
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import { stringify } from 'querystring';

import 'whatwg-fetch';

const url = process.env.NODE_ENV === 'production'
    ? ''
    : '//localhost:8081';

let controller = null;

export const searchByName = async (value: string, page: number = 0) => {
    if (!value) {
        return;
    }
    if (controller) {
        controller.abort();
    }
    controller = new AbortController();
    try {
        const query = stringify({
            name: value,
            page: page || null
        });
        return await (await fetch(`${url}/api?${query}`, { signal: controller.signal })).json() as ScgResponce;
    } catch (e) {
        const domException = e as DOMException;
        // ignore abortError
        if (domException.code === 20) {
            return;
        }
        throw e;
    } finally {
        controller = null;
    }
};
