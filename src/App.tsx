import * as React from 'react';
import * as querystring from 'query-string';

import { ParsedRow } from './entities/Row';
import { autocomplete, searchByName } from './api';

import './App.scss';
import { Updater } from './pwa/updater';
import { UpdateStatus, UpdateLabel } from './components/UpdateLabel';
import { Paging } from './entities/Paging';
import { AutocompleteCard } from './entities/AutocompleteCard';
import { debounce } from './utils/debounce';
import { ErrorTrap } from './components/ErrorTrap';
import { SearchList } from './layout/SearchList';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router';

interface Config {
    searchText?: string;
    page: number;
    pageCount: number;
    rows?: ParsedRow[];
}

interface State extends Paging {
    rows?: ParsedRow[];
    isFetching: boolean;
    updateStatus: UpdateStatus;
    searchText?: string;
    autocompletion?: Record<string, AutocompleteCard>;
    isAutocompletion: boolean;
    shouldUpdate: boolean;
}

type Props = Partial<RouteComponentProps>;

@(withRouter as any)
export class App extends React.Component<Props, State> {
    private readonly pwaUpdater: Updater;

    constructor (props) {
        super(props);

        const config: Config = JSON.parse(localStorage.getItem('config'));
        const { name: queryName, auto } = querystring.parse(this.props.location.search);

        this.state = {
            ...config,
            isFetching: false,
            updateStatus: UpdateStatus.NotRequired,
            isAutocompletion: false,
            searchText: queryName || config.searchText,
            shouldUpdate: Boolean(queryName) && queryName !== config.searchText
        };

        this.pwaUpdater = new Updater({
            onUpdateReady: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Required }),
            onUpdated: () => window.location.reload(true),
            onUpdateFailed: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Failed }),
            onUpdating: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Updating }),
        });
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
            this.setState({ ...this.state, searchText: queryName });
            this.requestData(queryName, auto);
        }
    }


    private onUpdateCancelled () {
        this.setState({ ...this.state, updateStatus: UpdateStatus.Cancelled });
    }

    private onTextChangedDebounced = debounce(async (value: string) => {
        if (!value) {
            this.setState({ ...this.state, autocompletion: undefined });
        }

        try {
            const records: Record<string, AutocompleteCard> = await autocomplete(value);
            this.setState({ ...this.state, autocompletion: records });
        } catch (e) {
            if (e.message !== 'no data') {
                throw e;
            }
            this.setState({ ...this.state, autocompletion: undefined });
        }
    }, 200);

    private onTextChanged (value: string) {
        this.setState({ ...this.state, searchText: value });
        this.onTextChangedDebounced(value);
    }

    private onSearch (value: string, isAutocompletion?: boolean) {
        if (!value) {
            return;
        }

        const { history } = this.props;
        const query: { name: string, auto?: boolean } = { name: value };
        if (isAutocompletion) {
            query.auto = true;
        }
        history.push(`?${ querystring.stringify(query) }`);

        this.requestData(value, isAutocompletion);
    }

    private onMore () {
        const { searchText, page, isAutocompletion } = this.state;
        this.requestData(searchText, isAutocompletion, page + 1);
    }

    private readonly requestData = async (value: string, isAutocompletion: boolean, newPage: number = 0) => {
        this.onTextChangedDebounced.cancel();

        const { rows: stateRows = [] } = this.state;
        const newStateRows = newPage > 0 ? stateRows : [];
        this.setState({
            ...this.state,
            isFetching: true,
            rows: newStateRows.length > 0 ? newStateRows : undefined,
            autocompletion: undefined,
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
        const { rows, pageCount, page, isFetching, updateStatus, autocompletion, searchText } = this.state;
        return (
            <div className="main-container">
                <ErrorTrap>
                    <Switch>
                        <Route path={ '/' }
                               children={ <SearchList onSearch={ this.onSearch.bind(this) }
                                                      onTextChanged={ (value) => this.onTextChanged(value) }
                                                      onMore={ this.onMore.bind(this) }
                                                      autocompletion={ autocompletion }
                                                      searchText={ searchText }
                                                      isFetching={ isFetching }
                                                      rows={ rows }
                                                      page={ page }
                                                      pageCount={ pageCount }
                               /> }/>
                    </Switch>

                    <UpdateLabel status={ updateStatus } onRequestUpdate={ () => this.pwaUpdater.performUpdate() }
                                 onUpdateCancelled={ () => this.onUpdateCancelled() }/>
                </ErrorTrap>
            </div>
        );
    }
}
