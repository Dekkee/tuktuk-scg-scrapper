import * as React from 'react';
import { useEffect, useState } from 'react';
import { ParsedRowDetails } from '@tuktuk-scg-scrapper/common/Row';
import { stringify } from 'querystring';

import './MtgGoldfishGraph.scss';
import { LoadingLabel } from '../LoadingLabel';
import { CardDetails } from '../CardDetails';

interface Props {
    card: ParsedRowDetails;
}

let graph: any = undefined;

const requestCard = async (state, setState, props) => {
    setState({ ...state, data: undefined, annotations: undefined, isFetching: true });

    const { card } = props;
    const q = {
        name: card.name,
        sub: card.subtitle,
        set: card.meta['set'] || card.meta,
        foil: card.meta['foil'] || false,
    };
    const { data, annotations } = await (await fetch(`/api/graph?${stringify(q)}`)).json();
    setState({ ...state, data, annotations, isFetching: false });

    const Dygraph = (await import('dygraphs')).default;
    const now = Date.now();
    let tobay = new Date();
    const before = tobay.setDate(tobay.getDate() - 360);
    const opt = {
        colors: ['#0066dd'],
        axisLineColor: 'rgb(150, 150, 150)',
        strokeWidth: 1,
        includeZero: true,
        gridLineColor: 'rgb(230, 230, 240)',
        axisLabelFontSize: 10,
        showRangeSelector: true,
        labelsDiv: 'graph-legend',
        rangeSelectorPlotStrokeColor: '#0066dd',
        rangeSelectorPlotFillColor: '#edf7ff',
        dateWindow: [before, now],
        underlayCallback: function (canvas, area, g) {
            const img = new Image();
            img.src =
                'https://assets1.mtggoldfish.com/assets/watermark-3d2ae1a6745ce7ba3412022ad06e3b496192545beb33a5da5d7f42ca475f1577.png';
            // watermark is 92 x 11
            canvas.drawImage(img, canvas.canvas.width - 100, canvas.canvas.height - 85);
        },
        connectSeparatedPoints: true,
        axes: {
            y: {
                valueFormatter: function (y) {
                    return y.toFixed(1);
                },
            },
        },
    };
    graph = new Dygraph(document.getElementById('graph'), data, opt);
    graph.setAnnotations(annotations);
};

export const MtgGoldfishGraph = (props: Props) => {
    const [state, setState] = useState({ isFetching: true });
    useEffect(() => {
        requestCard(state, setState, props);
    }, []);

    return (
        <div className="mtg-goldfish-graph">
            {state.isFetching ? (
                <LoadingLabel />
            ) : (
                <div className="mtg-goldfish-graph__graph">
                    <div className="mtg-goldfish-graph__legend">
                        <div id="graph-legend" />
                    </div>
                    <div id="graph" />
                </div>
            )}
        </div>
    );
};
