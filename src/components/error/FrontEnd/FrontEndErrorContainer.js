import React, {Component} from 'react';
import './FrontEndError.css';
import CloseIcon from '../icons/CloseIcon.svg';
import LeftArrow from '../icons/LeftArrow.svg';
import RightArrow from '../icons/RightArrow.svg';
import PropTypes from 'prop-types';
import InlineSVG from 'svg-inline-react';
import {FrontEndError} from './FrontEndError.react';

class FrontEndErrorContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 0,
        };
        this.nextError = this.nextError.bind(this);
        this.previousError = this.previousError.bind(this);
    }

    nextError() {
        const selected = this.state.selected;
        const max = this.props.errors.length-1;

        if(selected < max) {
            this.setState({
                selected: this.state.selected + 1
            })
        }
    }
    previousError() {
        const selected = this.state.selected;

        if(selected > 0) {
            this.setState({
                selected: this.state.selected - 1
            })
        }
    }

    render() {
        const currentError = this.props.errors[this.state.selected];
        const errorsLength = this.props.errors.length;
        const inAlertsTray = this.props.inAlertsTray;
        let cardClasses = "dash-error-card dash-error-card--container";
        if(inAlertsTray) {
            cardClasses += ' dash-error-card--alerts-tray';
        }
        return (
            <div className={cardClasses}>
                <div className="dash-error-card__topbar">
                    <InlineSVG
                        className="dash-fe-error__icon-arrow"
                        src={LeftArrow}
                        onClick={this.previousError}
                    />
                    <h6 className="dash-error-card__message">
                        New Alerts ({this.state.selected + 1} of {errorsLength})
                    </h6>
                    <InlineSVG
                        className="dash-fe-error__icon-arrow"
                        src={RightArrow}
                        onClick={this.nextError}
                    />
                    <InlineSVG
                        className="dash-fe-error__icon-close"
                        src={CloseIcon}
                        onClick={() =>
                            this.props.resolve('frontEnd', currentError.myUID)
                        }
                    />
                </div>
                <p />
                <FrontEndError e={currentError} />
            </div>
        );
    }
}

FrontEndErrorContainer.propTypes = {
    errors: PropTypes.array,
    resolve: PropTypes.func,
    inAlertsTray: PropTypes.bool
};

FrontEndErrorContainer.propTypes = {
    inAlertsTray: false
}

export {FrontEndErrorContainer};
