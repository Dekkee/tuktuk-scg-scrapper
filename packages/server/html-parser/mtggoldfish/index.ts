import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { logError } from '../../logger';
import { getMtgGoldfishSet } from '../entities/parseSet';

const dygraphConstructorArguments = [];

class Dygraph {
    constructor(...args: any[]) {
        if (args[0] === 'graphdiv-paper') dygraphConstructorArguments.push(args);
    }
}

type ParserArguments = {
    name: string;
    sub: string;
    set: string;
    foil: boolean;
};

export const parseGraph = async ({ name, sub, set, foil }: ParserArguments) => {
    try {
        console.log(`Parsing graph for: name: ${name} set ${set} foil: ${foil}`);
        const praparedName = `${name.replace(' ', '+').replace(/[',\.\:]/, '')}${Boolean(sub) ? `-${sub}` : ''}`;
        const praparedSet = `${getMtgGoldfishSet(set).replace(' ', '+')}${foil ? ':Foil' : ''}`;
        const url = `https://www.mtggoldfish.com/price/${praparedSet}/${praparedName}`;
        console.log(`Url: ${url}`);

        const pageContent = await (await fetch(url)).text();
        const dom = cheerio.load(pageContent);
        const scripts = dom('script:not([src])');
        let s;
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].children[0].data.includes('MTGGoldfishDygraph')) {
                s = scripts[i].children[0].data;
            }
        }

        // Мок для скрипта
        const MTGGoldfishDygraph = {
            renderAnnotations: () => {},
            bindGraphHandlers: () => {},
        };
        (global as any).MTGGoldfishDygraph = MTGGoldfishDygraph;
        // eval скрипта
        (function (s) {
            eval.call(this, s);
        })(s);

        // Мок jQuery
        const $ = function () {
            const o: any = {};
            o.on = function (_, f) {
                const e = {
                    target: {
                        hash: '#tab-paper',
                    },
                };
                f(e);
            };
            o.toggle = () => {};
            return o;
        };
        // Мок глобального контекста
        (global as any).$ = $;
        (global as any).Dygraph = Dygraph;
        (global as any).document = {
            getElementById: (e) => e,
        };
        // Инициализация графиков
        (function () {
            (MTGGoldfishDygraph as any).bindTabs.apply(this);
        })();

        // Получаем точки
        const data = dygraphConstructorArguments[0][1];
        dygraphConstructorArguments.length = 0;
        // Получаем аннотации
        const annotations = (MTGGoldfishDygraph as any).annotationsPaper;
        return { data, annotations };
    } catch (e) {
        logError('Graph parse fail', e);
        return {
            data: null,
            annotations: null,
        };
    }
};
