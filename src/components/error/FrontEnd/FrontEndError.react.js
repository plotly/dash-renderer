import './FrontEndError.css';
import ErrorIcon from '../icons/ErrorIcon.svg';
import CloseIcon from '../icons/CloseIcon.svg';
import PropTypes from 'prop-types';
import InlineSVG from 'svg-inline-react';

const FrontEndError = ({e, resolve}) => {
    let closeButton;
    // if resolve is defined, the error should be a standalone card
    if(resolve) {
        closeButton = <InlineSVG className="dash-fe-error__icon-close" src={CloseIcon} onClick={() => resolve('frontEnd', e.myUID)}/>
    }
    return (
        <div className={resolve ? 'dash-error-card' : 'dash-error-card__content'}>
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
};

export {FrontEndError};
