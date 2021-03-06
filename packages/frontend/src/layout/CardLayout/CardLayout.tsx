import * as React from 'react';

import { ParsedRowDetails } from '../../../../common/Row';
import { RouteComponentProps, withRouter } from 'react-router';
import { getCard } from '../../api';
import { LoadingLabel } from '../../components/LoadingLabel';
import { CardDetails } from '../../components/CardDetails';
import { history } from '../../utils/history';
import ArrowIcon from '../../icons/arrow_back.svg';

import './CardLayout.scss';

export interface State {
    card?: ParsedRowDetails;
    isFetching: boolean;
}

type Props = Partial<RouteComponentProps<{ id: string }>>;

@(withRouter as any)
export class CardLayout extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            isFetching: true,
        };
    }

    componentDidMount() {
        const { match } = this.props;
        const { id } = match.params;
        this.requestCard(id);
    }

    async requestCard(value: string) {
        this.setState({ ...this.state, card: undefined, isFetching: true });
        const { card } = await getCard(value);
        if (!card) return;
        this.setState({ ...this.state, card, isFetching: false });
    }

    onBackClick() {
        history.goBack();
    }

    render() {
        const { card, isFetching } = this.state;
        return (
            <div className="card-layout">
                <div className="card-layout__header">
                    <div className="card-layout__back-button" onClick={this.onBackClick}>
                        <ArrowIcon width={24} height={24} fill="#fff" />
                    </div>
                    <div className="card-layout__name">{card && card.name}</div>
                </div>
                {isFetching ? <LoadingLabel /> : <CardDetails card={card} />}
            </div>
        );
    }
}
