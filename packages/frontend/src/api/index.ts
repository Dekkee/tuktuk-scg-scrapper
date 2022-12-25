import { stringify } from 'querystring';

import { AutocompleteCard } from '../../../common/AutocompleteCard';
import { GetResponse, ListResponse } from '../../../common/Response';
import { abortableFetch } from '../utils/abortableFetch';

const url = !__dev__ ? '' : '//localhost:8081';

let controller: AbortController = null;

export const searchByName = async (value: string, isAutocompletion: boolean, page: number = 0) => {
    if (!value) {
        return;
    }
    try {
        const query = stringify({
            name: value,
            page: page || null,
            auto: isAutocompletion,
        });
        controller?.abort();
        const response = abortableFetch(`${url}/api/list?${query}`);
        controller = response.controller;
        return (await (await response).json()) as ListResponse;
    } catch (e) {
        // ignore abortError
        if (e.name === 'AbortError') {
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
        controller?.abort();
        const response = abortableFetch(`${url}/api/get?${query}`);
        controller = response.controller;
        return (await (await response).json()) as GetResponse;
    } catch (e) {
        // ignore abortError
        if (e.name === 'AbortError') {
            return { card: undefined };
        }
        throw e;
    } finally {
        controller = null;
    }
};

export const autocomplete = async (text: string): Promise<Record<string, AutocompleteCard> | undefined> => {
    const query = stringify({
        name: text,
    });
    return await (await fetch(`${url}/api/suggest?${query}`)).json();
};
