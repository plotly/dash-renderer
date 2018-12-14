import './FrontEndError.css';
import ErrorIcon from '../icons/ErrorIcon.svg';
import CloseIcon from '../icons/CloseIcon.svg';
import PropTypes from 'prop-types';
import InlineSVG from 'svg-inline-react';

const FrontEndError = ({e, resolve, inAlertsTray}) => {
    let closeButton, cardClasses;
    // if resolve is defined, the error should be a standalone card
    if(resolve) {
        closeButton = <InlineSVG className="dash-fe-error__icon-close" src={CloseIcon} onClick={() => resolve('frontEnd', e.myUID)}/>
        cardClasses = 'dash-error-card';
    } else {
        cardClasses = 'dash-error-card__content';
    }
    if(inAlertsTray) {
        cardClasses += ' dash-error-card--alerts-tray'
    }
    window.console.log('e', e)
    return (
        <div className={cardClasses}>
            <div className="dash-fe-error-top">
                <InlineSVG className="dash-fe-error__icon-error" src={ErrorIcon} />
                <h6 className="dash-fe-error__title">
                    {e.error.message ||
                        'An error was thrown that was not an Error object, so info could not be gathered.'}
                </h6>
                {closeButton}
            </div>
            <p />
            <div className="dash-fe-error__st">
                {e.error.stack &&
                    e.error.stack.split('\n').map(line => <p>{line}</p>)}
            </div>
        </div>
    );
};

FrontEndError.propTypes = {
    e: PropTypes.object,
    resolve: PropTypes.func,
    inAlertsTray: PropTypes.bool
};

FrontEndError.defaultProps = {
    inAlertsTray: false
}

export {FrontEndError};
