import React, {Component} from 'react';
import './DebugMenu.css';
import InlineSVG from 'svg-inline-react';
import DebugIcon from '../icons/DebugIcon.svg';
import WhiteCloseIcon from '../icons/WhiteCloseIcon.svg';
import PropTypes from 'prop-types';
import {DebugAlertContainer} from './DebugAlertContainer.react';
import GlobalErrorOverlay from '../GlobalErrorOverlay.react';
import {isEmpty} from 'ramda';

class DebugMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false,
            toastsEnabled: true,
        };
    }
    render() {
        const {opened, toastsEnabled} = this.state;
        const {errors, resolveError, dispatch} = this.props;

        const menuClasses = opened
            ? 'dash-debug-menu dash-debug-menu--opened'
            : 'dash-debug-menu dash-debug-menu--closed';

        const menuContent = opened ? (
            <div className="dash-debug-menu__content">
                <div className="dash-debug-menu__button-container">
                    <DebugAlertContainer errors={errors.frontEnd} />
                </div>
                <div className="dash-debug-menu__button-container">
                    <div className="dash-debug-menu__button">
                        Callback Graph
                    </div>
                </div>
                <div className="dash-debug-menu__button-container">
                    <div className="dash-debug-menu__button">
                        Live Reload (HMR)
                    </div>
                </div>
                <div className="dash-debug-menu__button-container">
                    <div
                        className={`dash-debug-menu__button ${toastsEnabled ? 'dash-debug-menu__button--enabled' : ''}`}
                        onClick={() =>
                            this.setState({
                                toastsEnabled: !toastsEnabled,
                            })
                        }
                    >
                        Display Toasts
                    </div>
                </div>
                <div className="dash-debug-menu__button-container">
                    <div
                        className="dash-debug-menu__button dash-debug-menu__button--small"
                        onClick={e => {
                            e.stopPropagation();
                            this.setState({opened: false});
                        }}
                    >
                        <InlineSVG
                            className="dash-debug-menu__icon--close"
                            src={WhiteCloseIcon}
                        />
                    </div>
                </div>
            </div>
        ) : (
            <InlineSVG className="dash-debug-menu__icon" src={DebugIcon} />
        );

        return (
            <div>
                <div
                    className={menuClasses}
                    onClick={() => this.setState({opened: true})}
                >
                    {menuContent}
                </div>
                <GlobalErrorOverlay
                    resolve={(type, myId) =>
                        resolveError(dispatch, type, myId)
                    }
                    error={errors}
                    visible={
                        !(isEmpty(errors.backEnd) && isEmpty(errors.frontEnd))
                    }
                    toastsEnabled={toastsEnabled}
                >
                    {this.props.children}
                </GlobalErrorOverlay>
            </div>
        );
    }
}

DebugMenu.propTypes = {
    children: PropTypes.object,
    errors: PropTypes.object,
    resolveError: PropTypes.function,
    dispatch: PropTypes.function,
};

export {DebugMenu};
