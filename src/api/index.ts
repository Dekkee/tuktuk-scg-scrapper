import { ScgListResponse } from '../server/html-parser/list';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import { stringify } from 'querystring';

import 'whatwg-fetch';
import { AutocompleteCard } from '../entities/AutocompleteCard';

const url = process.env.NODE_ENV === 'production'
    ? ''
    : '//localhost:8081';

let controller = null;

export const searchByName = async (value: string, isAutocompletion: boolean, page: number = 0) => {
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
            auto: isAutocompletion
        });
        return await (await fetch(`${url}/api?${query}`, { signal: controller.signal })).json() as ScgListResponse;
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

export const autocomplete = async (text: string): Promise<Record<string, AutocompleteCard> | undefined> => {
    return new Promise((resolve, reject) => {
        const callback = `scg${getRandomInt(1000000, 9999999)}`;
        const url = `//www.starcitygames.com/autocomplete/products.php?callback=${callback}&term=${text}`;
        let response = null;
        window[ callback ] = function (object: Record<string, any>) {
            response = object;
            if (scr) {
                document.querySelector('body').removeChild(scr);
            }
        };
        const scr = document.createElement('script');
        scr.src = url;
        scr.async = false;
        scr.onload = () => {
            if (Boolean(response)) {
                resolve(response);
            } else {
                reject(new Error('no data'));
                if (scr) {
                    document.querySelector('body').removeChild(scr);
                }
            }
        };
        document.querySelector('body').appendChild(scr);
    });
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;
