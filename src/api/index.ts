import { ScgResponce } from '../server/html-parser';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import { stringify } from 'querystring';

import 'whatwg-fetch';
import { AutocompleteCard } from '../entities/AutocompleteCard';

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

export const autocomplete = async (text: string): Promise<Record<string, AutocompleteCard> | undefined> => {
    return new Promise((resolve, reject) => {
        // http://www.starcitygames.com/autocomplete/products.php?callback=jQuery32107046950589933074_1543757384839&term=j&_=1543757384840
        const callback = `scg${getRandomInt(1000000, 9999999)}`;
        const url = `http://www.starcitygames.com/autocomplete/products.php?callback=${callback}&term=${text}`;
        let response = null;
        window[ callback ] = function (object: Record<string, any>) {
            response = object;
        };
        const scr = document.createElement('script');
        scr.src = url;
        scr.async = false;
        scr.onload = () => {
            if (Boolean(response)) {
                resolve(response);
            } else {
                reject('no data');
            }
        };
        document.querySelector('body').appendChild(scr);
    });
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;
