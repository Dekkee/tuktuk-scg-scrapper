import * as OfflinePluginRuntime from '@lcdp/offline-plugin/runtime';

export type Params = {
    onUpdating: () => void;
    onUpdateReady: () => void;
    onUpdated: () => void;
    onUpdateFailed: () => void;
};

export class Updater {
    constructor(params: Params) {
        OfflinePluginRuntime.install({ ...params });
    }

    public performUpdate() {
        OfflinePluginRuntime.applyUpdate();
    }
}
