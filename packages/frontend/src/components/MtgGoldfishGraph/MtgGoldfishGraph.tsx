import * as React from 'react';
import { ParsedRowDetails } from '@tuktuk-scg-scrapper/common/Row';
import { stringify } from 'querystring';

import './MtgGoldfishGraph.scss';

interface Props {
    card: ParsedRowDetails;
}

export class MtgGoldfishGraph extends React.Component<Props> {
    private graph: any;

    constructor(props) {
        super(props);

        this.state = {
            isFetching: true,
        };
    }

    componentDidMount() {
        this.requestCard();
    }

    async requestCard() {
        this.setState({ ...this.state, data: undefined, annotations: undefined, isFetching: true });

        const { card } = this.props;
        const q = {
            name: card.name,
            sub: card.subtitle,
            set: card.meta['set'] || card.meta,
            foil: card.meta['foil'] || false,
        };
        const { data, annotations } = await (await fetch(`/api/graph?${stringify(q)}`)).json();
        this.setState({ ...this.state, data, annotations, isFetching: false });
        const Dygraph = (await import('dygraphs')).default;
        const now = Date.now();
        let tobay = new Date();
        const before = tobay.setDate(tobay.getDate() - 360);
        const opt = {
            colors: ['#0066dd'],
            // fillGraph: true,
            axisLineColor: 'rgb(150, 150, 150)',
            strokeWidth: 1,
            includeZero: true,
            gridLineColor: 'rgb(230, 230, 240)',
            axisLabelFontSize: 10,
            showRangeSelector: true,
            labelsDiv: 'graph-legend',
            // labelsDivStyles: {
            //     'font-weight': 'normal',
            //     'font-size': 6,
            //     textAlign: 'right',
            //     backgroundColor: 'transparent',
            // },
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
            // yAxisLabelWidth: 20,
            axes: {
                y: {
                    valueFormatter: function (y) {
                        return y.toFixed(1);
                    },
                },
            },
        };
        this.graph = new Dygraph(document.getElementById('graph'), data, opt);
        this.graph.setAnnotations(annotations);
    }

    render() {
        return (
            <div className="mtg-goldfish-graph">
                <div className="mtg-goldfish-graph__legend">
                    <div id="graph-legend" />
                </div>
                <div className="mtg-goldfish-graph__graph" id="graph" />
            </div>
        );
    }
}
