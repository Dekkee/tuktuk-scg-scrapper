import * as React from 'react';

export class ErrorTrap extends React.PureComponent<{}> {
    constructor(props) {
        super(props)
    }

    componentDidCatch(errorString, errorInfo) {
        localStorage.setItem('config', JSON.stringify({}));
        location.reload(true);
    }

    render() {
        return (
            <div className="update-label update-label--failed">
                <i className="icon-sad icon-big" />Update is failed!
            </div>
        )
    }
}