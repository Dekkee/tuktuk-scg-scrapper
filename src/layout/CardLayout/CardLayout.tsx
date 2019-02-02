import * as React from 'react';

import { ParsedRowDetails } from '../../entities/Row';
import { RouteComponentProps, withRouter } from 'react-router';
import { getCard } from '../../api';
import { LoadingLabel } from '../../components/LoadingLabel';
import { CardDetails } from '../../components/CardDetails/CardDetails';
import { Button } from '../../components/Button';
import { history } from '../../utils/history';

export interface State {
    card?: ParsedRowDetails,
    isFetching: boolean;
}

type Props = Partial<RouteComponentProps<{ id: string }>>;

@(withRouter as any)
export class CardLayout extends React.Component<Props, State> {
    constructor (props) {
        super(props);

        this.state = {
            isFetching: true,
        };
    }

    componentDidMount () {
        const { match } = this.props;
        const { id } = match.params;
        this.requestCard(id);
    };

    requestCard = async (value: string) => {
        this.setState({ ...this.state, card: undefined, isFetching: true });
        const { card } = await getCard(value);
        this.setState({ ...this.state, card, isFetching: false });
    };

    onBackClick() {
        history.goBack();
    }

    render () {
        const { card, isFetching } = this.state;
        return (<>
            <Button onClick={this.onBackClick} label="< Back" width={100}/>
            { isFetching ? <LoadingLabel/> : <CardDetails card={ card }/> }
        </>);
    }
}
