import './DebugAlertContainer.css';
import {Component} from 'react';
import PropTypes from 'prop-types';
import WarningIcon from '../icons/WarningIcon.svg';
import ErrorIcon from '../icons/ErrorIcon.svg';
import InlineSVG from 'svg-inline-react';

class DebugAlertContainer extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className='dash-debug-alert-container'>
            <div className='dash-debug-alert'>
                <InlineSVG className="dash-debug-alert-container__icon" src={ErrorIcon} />
                {this.props.errors.length}
            </div>
            <InlineSVG className="dash-debug-alert-container__icon dash-debug-alert-container__icon--warning" src={WarningIcon} />
        </div>
    }
}

DebugAlertContainer.propTypes = {
    errors: PropTypes.object
}

export {
    DebugAlertContainer
}
