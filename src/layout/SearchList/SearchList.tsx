import * as React from 'react';
import * as querystring from 'query-string';

import { SearchInput } from '../../components/SearchInput';
import { CardsTable } from '../../components/CardsTable';
import { LoadingLabel } from '../../components/LoadingLabel';
import { ParsedRow } from '../../entities/Row';
import { ShowMore } from '../../components/ShowMore';
import { Paging } from '../../entities/Paging';
import { RouteComponentProps, withRouter } from 'react-router';
import { searchByName } from '../../api';

type Props = Partial<RouteComponentProps>;

interface State extends Paging {
    rows?: ParsedRow[];
    card?: ParsedRow;
    isFetching: boolean;
    searchText?: string;
    isAutocompletion: boolean;
    shouldUpdate: boolean;
}

interface Config {
    searchText?: string;
    page: number;
    pageCount: number;
    rows?: ParsedRow[];
    card?: ParsedRow;
}

@(withRouter as any)
export class SearchList extends React.Component<Props, State> {
    constructor (props) {
        super(props);

        const config: Config = JSON.parse(localStorage.getItem('config'));
        const { name: queryName, auto } = querystring.parse(this.props.location.search);

        this.state = {
            ...config,
            isFetching: false,
            isAutocompletion: false,
            searchText: queryName as string || (config && config.searchText) || '',
            shouldUpdate: Boolean(queryName) && queryName !== config.searchText
        };
    }

    componentDidMount (): void {
        const { shouldUpdate, searchText, isAutocompletion } = this.state;
        if (shouldUpdate) {
            this.requestData(searchText, isAutocompletion);
        }
    }

    componentWillReceiveProps (nextProps): void {
        const { name: queryName, auto } = querystring.parse(nextProps.location.search);
        const { searchText } = this.state;

        if (queryName !== searchText) {
            this.setState({ ...this.state, searchText: queryName as string });
        }
    }

    private onSearch = async (value: string, isAutocompletion?: boolean) => {
        if (!value) {
            return;
        }

        const { history } = this.props;
        const query: { name: string, auto?: boolean } = { name: value };
        if (isAutocompletion) {
            query.auto = true;
        }
        await this.requestData(value, isAutocompletion);
        history.push(`?${ querystring.stringify(query) }`);
    };

    private onMore () {
        const { searchText, page, isAutocompletion } = this.state;
        this.requestData(searchText, isAutocompletion, page + 1);
    }

    private readonly requestData = async (value: string, isAutocompletion: boolean, newPage: number = 0) => {
        const { rows: stateRows = [] } = this.state;
        const newStateRows = newPage > 0 ? stateRows : [];
        this.setState({
            ...this.state,
            isFetching: true,
            rows: newStateRows.length > 0 ? newStateRows : undefined,
            isAutocompletion,
            searchText: value
        });
        const res = await searchByName(value, isAutocompletion, newPage);
        if (!res) {
            return;
        }
        const { rows, page, pageCount } = res;
        const config: Config = {
            rows: [ ...newStateRows, ...rows ],
            page,
            pageCount,
            searchText: value
        };
        localStorage.setItem('config', JSON.stringify(config));
        this.setState({
            ...this.state,
            ...config,
            isFetching: false,
            shouldUpdate: false
        });
    };

    render () {
        const { isFetching, rows, searchText, pageCount, page } = this.state;
        return (<>
            <SearchInput onSearchRequested={ this.onSearch.bind(this) }
                         initialText={ searchText }/>
            <article className="content-container">
                { (!isFetching || rows) && <CardsTable rows={ rows }/> }
                { isFetching && <LoadingLabel/> }
            </article>
            { page < pageCount - 1 && !isFetching && <ShowMore onMoreRequested={ this.onMore.bind(this) }/> }
        </>);
    }
}
