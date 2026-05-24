import { registerSW } from 'virtual:pwa-register';

export type Params = {
    onUpdating: () => void;
    onUpdateReady: () => void;
    onUpdated: () => void;
    onUpdateFailed: () => void;
};

export class Updater {
    private readonly updateSW: (reloadPage?: boolean) => Promise<void>;
    private readonly onUpdating: () => void;
    private readonly onUpdated: () => void;
    private readonly onUpdateFailed: () => void;

    constructor(params: Params) {
        this.onUpdating = params.onUpdating;
        this.onUpdated = params.onUpdated;
        this.onUpdateFailed = params.onUpdateFailed;

        this.updateSW = registerSW({
            onNeedRefresh: () => params.onUpdateReady(),
            onRegisterError: () => params.onUpdateFailed(),
        });
    }

    public async performUpdate() {
        try {
            this.onUpdating();
            await this.updateSW(true);
            this.onUpdated();
        } catch {
            this.onUpdateFailed();
        }
    }
}
