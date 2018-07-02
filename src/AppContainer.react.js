import {connect} from 'react-redux';
import React from 'react';
import Authentication from './Authentication.react';
import APIController from './APIController.react';
import DocumentTitle from './components/core/DocumentTitle.react';
import Loading from './components/core/Loading.react';
import LoadingProvider from './components/core/LoadingProvider.react';
import Toolbar from './components/core/Toolbar.react';

function UnconnectedAppContainer() {
    return (
        <Authentication>
            <LoadingProvider>
                <Toolbar/>
                <APIController/>
                <DocumentTitle/>
                <Loading/>
            </LoadingProvider>
        </Authentication>
    );
}

const AppContainer = connect(
    state => ({
        history: state.history
    }),
    dispatch => ({dispatch})
)(UnconnectedAppContainer);

export default AppContainer;
