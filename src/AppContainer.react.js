import {connect} from 'react-redux'
import React from 'react';
import Authentication from './Authentication.react';
import APIController from './APIController.react';
import DocumentTitle from './components/core/DocumentTitle.react';
import Loading from './components/core/Loading.react';
import Toolbar from './components/core/Toolbar.react';
import PropTypes from 'prop-types';
import {setHooks} from "./actions/index";

function UnconnectedAppContainer({hooks, dispatch}) {
    if(hooks.request_pre !== null || hooks.request_post !== null) {
        dispatch(setHooks(hooks));
    }
    return (
        <Authentication>
            <div>
                <Toolbar/>
                <APIController/>
                <DocumentTitle/>
                <Loading/>
            </div>
        </Authentication>
    );
}

UnconnectedAppContainer.propTypes = {
    hooks: PropTypes.object,
    dispatch: PropTypes.func
}


export default connect()(UnconnectedAppContainer);
