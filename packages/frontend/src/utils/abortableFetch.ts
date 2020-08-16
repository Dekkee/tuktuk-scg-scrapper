import 'yet-another-abortcontroller-polyfill';
import { fetch } from 'whatwg-fetch';

// use native browser implementation if it supports aborting
const fetchObject = 'signal' in new Request('') ? window.fetch : fetch;

type FetchReturnType = ReturnType<typeof window.fetch> & { controller: AbortController };

export const abortableFetch: (input: RequestInfo, init?: RequestInit) => FetchReturnType = (input, init) => {
    const controller = new AbortController();

    const p = fetchObject(input, {
        ...init,
        signal: controller.signal,
    });

    p.controller = controller;

    return p;
};
