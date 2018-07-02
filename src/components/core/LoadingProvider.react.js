import {connect} from 'react-redux'
import {any} from 'ramda'
import React from 'react'
import PropTypes from 'prop-types';

function LoadingProvider(props) {
    if (any(r => r.status === 'loading', props.requestQueue)) {
        return (
            <div className="_dash-loading-callback-parent">
                {props.children}
            </div>
        );
    } else {
        return (
            <div>
                {props.children}
            </div>
        );
    }
}

LoadingProvider.propTypes = {
    requestQueue: PropTypes.array.isRequired,
    children: PropTypes.node.isRequired
};

export default connect(
    state => ({
        requestQueue: state.requestQueue
    })
)(LoadingProvider);
