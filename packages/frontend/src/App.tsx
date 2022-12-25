import * as React from 'react';

import './App.scss';
import { Updater } from './pwa/updater';
import { UpdateLabel, UpdateStatus } from './components/UpdateLabel';
import { ErrorTrap } from './components/ErrorTrap';
import { SearchList } from './layout/SearchList';
import { RouterProvider } from 'react-router';
import { CardLayout } from './layout/CardLayout';
import { SettingsProvider } from './layout/SettingsContext';
import { createBrowserRouter } from 'react-router-dom';

interface State {
    updateStatus: UpdateStatus;
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <SearchList />,
    },
    {
        path: "/card/:id",
        element: <CardLayout />,
    }
]);

export class App extends React.Component<{}, State> {
    private readonly pwaUpdater: Updater;

    constructor(props) {
        super(props);

        this.state = {
            updateStatus: UpdateStatus.NotRequired,
        };

        this.pwaUpdater = new Updater({
            onUpdateReady: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Required }),
            onUpdated: () => window.location.reload(),
            onUpdateFailed: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Failed }),
            onUpdating: () => this.setState({ ...this.state, updateStatus: UpdateStatus.Updating }),
        });
    }

    private onUpdateCancelled() {
        this.setState({ ...this.state, updateStatus: UpdateStatus.Cancelled });
    }

    render() {
        const { updateStatus } = this.state;
        return (
            <SettingsProvider>
                <main className="main-container" role="main">
                    <ErrorTrap>
                        <RouterProvider router={router}/>

                        <UpdateLabel status={updateStatus}
                            onRequestUpdate={() => this.pwaUpdater.performUpdate()}
                            onUpdateCancelled={() => this.onUpdateCancelled()} />
                    </ErrorTrap>
                </main>
            </SettingsProvider>
        );
    }
}
