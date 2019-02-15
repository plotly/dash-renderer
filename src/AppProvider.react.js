import React from 'react';
import {Provider} from 'react-redux';

import initializeStore from './store';
import AppContainer from './AppContainer.react';

import PropTypes from 'prop-types';

const store = initializeStore();

const AppProvider = ({hooks}) => {
    return (
        <Provider store={store}>
            <AppContainer hooks={hooks}/>
        </Provider>
    );
}

AppProvider.propTypes = {
    hooks: PropTypes.object
}

export default AppProvider;
