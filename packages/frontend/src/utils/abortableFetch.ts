type FetchReturnType = ReturnType<typeof window.fetch> & { controller: AbortController };

export const abortableFetch: (input: RequestInfo, init?: RequestInit) => FetchReturnType = (input, init) => {
    const controller = new AbortController();

    const p = window.fetch(input, {
        ...init,
        signal: controller.signal,
    }) as FetchReturnType;

    p.controller = controller;

    return p;
};
