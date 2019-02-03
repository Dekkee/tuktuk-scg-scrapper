import * as React from 'react';
import * as cn from 'classnames';

import './UpdateLabel.scss';
import { Button } from '../Button';

export enum UpdateStatus {
    Required,
    NotRequired,
    Updating,
    Failed,
    Cancelled
}

export interface Props {
    status: UpdateStatus;
    onRequestUpdate: () => void;
    onUpdateCancelled: () => void;
}

export class UpdateLabel extends React.PureComponent<Props> {
    constructor (props) {
        super(props);
    }

    render () {
        const { status, onRequestUpdate, onUpdateCancelled } = this.props;
        const isHidden = status === UpdateStatus.NotRequired || status === UpdateStatus.Cancelled;
        const isFailed = status === UpdateStatus.Failed;
        return (
            <div className={ cn(
                'update-label-container',
                { 'update-label-container--hidden': isHidden },
                { 'update-label-container--failed': isFailed },
            ) }>
                {
                    status === UpdateStatus.Required &&
                    <div className="update-label update-label--ready">
                        <div className="update-label__text">Update is ready.</div>
                        <Button label="Refresh" onClick={ onRequestUpdate }/>
                    </div>
                }
                {
                    status === UpdateStatus.Updating &&
                    <div className="update-label update-label--updating"><i
                        className="icon-spinner8 icon-big icon-rotating"/>Loading update!</div>
                }
                {
                    status === UpdateStatus.Failed &&
                    <div className="update-label update-label--failed"><i className="icon-sad icon-big"/>Update
                        is failed!</div>
                }
                {
                    !isHidden &&
                    <div className="update-label__close"
                         onClick={ onUpdateCancelled }>&times;</div>
                }
            </div>
        );
    }
}
