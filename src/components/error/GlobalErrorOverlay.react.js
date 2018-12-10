import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'ramda';
import {FrontEndError} from './FrontEnd/FrontEndError.react.js';
import './GlobalErrorOverlay.css';
import { FrontEndErrorContainer } from './FrontEnd/FrontEndErrorContainer.js';

export default class GlobalErrorOverlay extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {resolve, visible, error} = this.props;
        let frontEndErrors;
        if (error.frontEnd.length > 1) {
            frontEndErrors = <FrontEndErrorContainer errors={error.frontEnd} resolve={resolve} />;
        } else if (!isEmpty(error.frontEnd)){
            const e = error.frontEnd[0];
            frontEndErrors = <FrontEndError e={e} resolve={resolve} />;
        }
        return (
            <div>
                <div>{this.props.children}</div>
                <div className="dash-error-menu">
                    {isEmpty(error.backEnd) ? null : (
                        <button onClick={() => resolve('backEnd')}>
                            Resolve BackEnd Error
                        </button>
                    )}
                    <div className={visible ? 'dash-fe-errors' : ''}>
                        {frontEndErrors}
                    </div>
                </div>
            </div>
        );
    }
}

GlobalErrorOverlay.propTypes = {
    children: PropTypes.object,
    resolve: PropTypes.func,
    visible: PropTypes.bool,
    error: PropTypes.object,
};
