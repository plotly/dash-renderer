/* eslint-env browser */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import AppProvider from './AppProvider.react';

class DashRenderer {
    constructor(hooks = { request_pre: null, request_post: null}) {
        // render Dash Renderer upon initialising!
        ReactDOM.render(
            <AppProvider hooks={hooks} />,
            document.getElementById('react-entry-point')
        );
    }
}

export { DashRenderer };