/* eslint-env browser */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import AppProvider from './AppProvider.react';
import PropTypes from 'prop-types';

class DashRenderer {
    constructor(hooks) {
        // render Dash Renderer upon initialising!
        ReactDOM.render(
            <AppProvider hooks={hooks} />,
            document.getElementById('react-entry-point')
        );
    }
}

DashRenderer.propTypes = {
    hooks: PropTypes.shape({
        request_pre: PropTypes.func,
        request_post: PropTypes.func
    })
}

DashRenderer.defaultProps = {
    hooks: {
        request_pre: null,
        request_post: null
    }
}

export { DashRenderer };
