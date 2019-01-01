import * as React from 'react';

import { ParsedRow } from './entities/Row';
import { SearchInput } from './components/SearchInput';
import { autocomplete, searchByName } from './api';

import './App.scss';
import { Updater } from './pwa/updater';
import { UpdateStatus, UpdateLabel } from './components/UpdateLabel';
import { CardsLayout } from './components/CardsLayout';
import { Paging } from './entities/Paging';
import { ShowMore } from './components/ShowMore';
import { LoadingLabel } from './components/LoadingLabel';
import { AutocompleteCard } from './entities/AutocompleteCard';
import { debounce } from './utils/debounce';

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
}

export class App extends React.Component<{}, State> {
    private readonly pwaUpdater: Updater;

    constructor(props) {
        super(props);

        const config: Config = JSON.parse(localStorage.getItem('config'));

        this.state = {
            ...config,
            isFetching: false,
            updateStatus: UpdateStatus.NotRequired,
        };

        this.pwaUpdater = new Updater({
            onUpdateReady: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Required }),
            onUpdated: () => window.location.reload(true),
            onUpdateFailed: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Failed }),
            onUpdating: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Updating }),
        });
    }

    private onUpdateCancelled() {
        this.setState({ ...this.state, updateStatus: UpdateStatus.Cancelled });
    }

    private onTextChanged = debounce(async (value: string) => {
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

    private onSearch(value: string) {
        if (!value || value === this.state.searchText) {
            return;
        }
        this.requestData(value);
    }

    private onMore() {
        const { searchText, page } = this.state;
        this.requestData(searchText, page + 1);
    }

    private readonly requestData = async (value: string, newPage: number = 0) => {
        this.onTextChanged.cancel();

        const { rows: stateRows = [] } = this.state;
        const newStateRows = newPage > 0 ? stateRows : [];
        this.setState({
            ...this.state,
            isFetching: true,
            rows: newStateRows.length > 0 ? newStateRows : undefined,
            autocompletion: undefined
        });
        const res = await searchByName(value, newPage);
        if (!res) {
            return;
        }
        const { rows, page, pageCount } = res;
        const config: Config = {
            rows: [...newStateRows, ...rows],
            page, 
            pageCount,
            searchText: value
        }
        localStorage.setItem('config', JSON.stringify(config));
        this.setState({
            ...this.state,
            ...config,
            isFetching: false
        });
    };

    render() {
        const { rows, pageCount, page, isFetching, updateStatus, autocompletion, searchText } = this.state;
        return (
            <div className="main-container">
                <SearchInput onSearchRequested={(value) => this.onSearch(value)}
                    onTextChanged={(value) => this.onTextChanged(value)}
                    autocompletion={autocompletion} 
                    inititalText={searchText} />
                <div className="content-container">
                    {(!isFetching || rows) && <CardsLayout rows={rows} />}
                    {isFetching && <LoadingLabel />}
                </div>
                {page < pageCount - 1 && !isFetching && <ShowMore onMoreRequested={() => this.onMore()} />}
                <UpdateLabel status={updateStatus} onRequestUpdate={() => this.pwaUpdater.performUpdate()}
                    onUpdateCancelled={() => this.onUpdateCancelled()} />
            </div>
        );
    }
}
