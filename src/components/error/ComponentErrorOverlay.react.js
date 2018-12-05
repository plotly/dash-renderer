import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './ComponentErrorOverlay.css';

export default class ComponentErrorOverlay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popoverOpen: false,
        };
        this.togglePopOver = this.togglePopOver.bind(this);
    }

    togglePopOver() {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        });
    }

    render() {
        const {
            error,
            componentId,
            componentType,
            resolve,
            children,
        } = this.props;
        const errorLocationString =
            'Error in ' + componentType + '(id=' + componentId + ')';
        const errorString = error.name + ' -- ' + error.message;
        return (
            <div className="dash-error-overlay-container">
                <div
                    onClick={this.togglePopOver}
                    className="dash-error-overlay"
                >
                    <div className='dash-error-overlay__children'>{children}</div>
                    <div
                        className={
                            this.state.popoverOpen
                                ? 'dash-error-overlay__modal'
                                : 'dash-error-overlay__modal--closed'
                        }
                        toggle={this.togglePopOver}
                    >
                        <strong>{errorLocationString}</strong>
                        <p>{errorString}</p>
                        <button onClick={resolve}>Resolve Error</button>
                    </div>
                </div>
            </div>
        );
    }
}

ComponentErrorOverlay.propTypes = {
    children: PropTypes.object,
    oldChildren: PropTypes.object,
    error: PropTypes.object,
    componentId: PropTypes.string,
    componentType: PropTypes.string,
    resolve: PropTypes.func,
};
