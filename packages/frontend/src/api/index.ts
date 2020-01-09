import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import { stringify } from 'querystring';

import 'whatwg-fetch';
import { AutocompleteCard } from '../../../common/AutocompleteCard';
import { GetResponse, ListResponse } from '../../../common/Response';

const url = process.env.NODE_ENV === 'production' ? '' : '//localhost:8081';

let controller = null;

export const searchByName = async (
    value: string,
    isAutocompletion: boolean,
    page: number = 0
) => {
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
            page: page || null,
            auto: isAutocompletion,
        });
        return (await (
            await fetch(`${url}/api/list?${query}`, {
                signal: controller.signal,
            })
        ).json()) as ListResponse;
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

export const getCard = async (value: string) => {
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
        });
        return (await (
            await fetch(`${url}/api/get?${query}`, {
                signal: controller.signal,
            })
        ).json()) as GetResponse;
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

export const autocomplete = async (
    text: string
): Promise<Record<string, AutocompleteCard> | undefined> => {
    const query = stringify({
        name: text,
    });
    return await (await fetch(`${url}/api/suggest?${query}`)).json();
};
