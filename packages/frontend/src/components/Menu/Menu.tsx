import * as React from 'react';
import { ChangeEvent, useContext } from 'react';
import { SettingsContext } from '../../layout/SettingsContext';

import BackIcon from '../../icons/arrow_back.svg';

import './Menu.scss';

export interface Props {
    onClose: VoidFunction;
}

export const Menu = ({ onClose }: Props) => {
    const [settings, setSettings] = useContext(SettingsContext);

    const onInput = (e: ChangeEvent) => {
        const { value } = e.target as HTMLInputElement;
        setSettings({ ...settings, rubleCourse: parseInt(value) || 0 });
    };

    const { rubleCourse = 0 } = settings;
    return (<div className="menu">
        <div className="menu__header">
            <div className="menu__back-button" onClick={onClose.bind(this)}><BackIcon width={24} height={24}/></div>
            <div className="menu__title">Settings</div>
        </div>

        <div className="menu__settings">
            <label className="menu__field" htmlFor="ruble-course-input">
                Ruble multiplier: <span>
                    <input className="ruble-course"
                           id="ruble-course-input"
                           value={rubleCourse}
                           onChange={onInput}/>{'\u20bd'}</span>
            </label>
        </div>
    </div>);
};
