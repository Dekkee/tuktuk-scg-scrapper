import * as React from 'react';

import './App.scss';
import { Updater } from './pwa/updater';
import { UpdateLabel, UpdateStatus } from './components/UpdateLabel';
import { ErrorTrap } from './components/ErrorTrap';
import { SearchList } from './layout/SearchList';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import { CardLayout } from './layout/CardLayout';
import { SettingsProvider } from './layout/SettingsContext';

interface State {
    updateStatus: UpdateStatus;
}

type Props = Partial<RouteComponentProps>;

@(withRouter as any)
export class App extends React.Component<Props, State> {
    private readonly pwaUpdater: Updater;

    constructor (props) {
        super(props);

        this.state = {
            updateStatus: UpdateStatus.NotRequired,
        };

        this.pwaUpdater = new Updater({
            onUpdateReady: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Required }),
            onUpdated: () => window.location.reload(true),
            onUpdateFailed: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Failed }),
            onUpdating: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Updating }),
        });
    }

    private onUpdateCancelled () {
        this.setState({ ...this.state, updateStatus: UpdateStatus.Cancelled });
    }

    render () {
        const { updateStatus } = this.state;
        return (
            <SettingsProvider>
                <main className="main-container" role="main">
                    <ErrorTrap>
                        <Switch>
                            <Route exact path="/" component={SearchList}/>
                            <Route path="/card/:id/" component={CardLayout}/>
                        </Switch>

                        <UpdateLabel status={updateStatus}
                                     onRequestUpdate={() => this.pwaUpdater.performUpdate()}
                                     onUpdateCancelled={() => this.onUpdateCancelled()}/>
                    </ErrorTrap>
                </main>
            </SettingsProvider>
        );
    }
}
