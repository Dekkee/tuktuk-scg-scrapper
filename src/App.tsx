import * as React from 'react';

import { ParsedRow } from './entities/Row';
import { SearchInput } from './components/SearchInput';
import { searchByName } from './api';

import './App.scss';
import { Updater } from './pwa/updater';
import { UpdateStatus, UpdateLabel } from './components/UpdateLabel';
import { CardsLayout } from './components/CardsLayout';

interface State {
    rows?: ParsedRow[];
    isFetching: boolean;
    updateStatus: UpdateStatus;
}

export class App extends React.Component<{}, State> {
    private readonly pwaUpdater: Updater;
    private controller: AbortController;

    constructor (props) {
        super(props);

        this.state = {
            rows: null,
            isFetching: false,
            updateStatus: UpdateStatus.NotRequired,
        };

        this.pwaUpdater = new Updater({
            onUpdateReady: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Required }),
            onUpdated: () => window.location.reload(),
            onUpdateFailed: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Failed }),
            onUpdating: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Updating }),
        });

        this.controller = null;
    }

    private onUpdateCancelled () {
        this.setState({ ...this.state, updateStatus: UpdateStatus.Cancelled });
    }

    private readonly requestData = async (value: string) => {
        if (!value) {
            return;
        }
        this.setState({ ...this.state, isFetching: true });
        try {
            const { rows } = await searchByName(value);
            if (rows && rows.length > 0) {
                this.setState({ ...this.state, rows, isFetching: false });
                return;
            }
        } catch (e) {
            const domException = e as DOMException;
            // abortError
            if (domException.code === 20) {
                return;
            }
            this.setState({ ...this.state, isFetching: false });
        }
    };

    render () {
        const { rows, isFetching, updateStatus } = this.state;
        return (
            <div className="main-container">
                <SearchInput onSearchRequested={ (value) => this.requestData(value) }/>
                <div className="content-container">
                    {
                        isFetching
                            ? <div className="loading-container">
                                <div className="loading"><i className="icon-spinner8 icon-big icon-rotating"/>Loading</div>
                            </div>
                            : <CardsLayout rows={rows}/>
                    }
                </div>
                <UpdateLabel status={ updateStatus } onRequestUpdate={ () => this.pwaUpdater.performUpdate() }
                             onUpdateCancelled={ () => this.onUpdateCancelled() }/>
            </div>
        );
    }
}
