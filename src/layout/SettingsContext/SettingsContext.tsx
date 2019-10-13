import * as React from 'react';
import { useState } from 'react';
import { debounce } from '../../utils/debounce';
import { Dispatch } from 'react';
import { SetStateAction } from 'react';

const SettingsKey = 'SETTINGS';

export interface SettingsType {
    rubleCourse?: number;
}

type SettingsHook = [SettingsType, Dispatch<SetStateAction<SettingsType>>];

const initialSettings: SettingsType = JSON.parse(localStorage.getItem(SettingsKey)) || {
    rubleCourse: 0
};

const SettingsContext = React.createContext<SettingsHook>([initialSettings, () => {}]);

const SettingsProvider = ({ children }) => {
    const [state, setState] = useState<SettingsType>(initialSettings);
    const debounceSetState = debounce((settings) => {
        localStorage.setItem(SettingsKey, JSON.stringify(settings));
        setState(settings);
    }, 100);

    return (
        <SettingsContext.Provider value={[state, debounceSetState]}>
            {children}
        </SettingsContext.Provider>
    );
};

export { SettingsContext, SettingsProvider };
