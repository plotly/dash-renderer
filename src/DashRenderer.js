/*eslint-env browser */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import AppProvider from './AppProvider.react';

class DashRenderer {
    constructor(hooks = { request_pre: null, request_post: null}) {
        // do hooksstuff here, like custom hooks

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
        request_post: PropTypes.func,
    })
}

export { DashRenderer };