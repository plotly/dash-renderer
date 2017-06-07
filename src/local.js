/*eslint-env browser */
import React from 'react';
import ReactDOM from 'react-dom';
require('es6-promise').polyfill();
import {combineReducers} from 'redux';
import {connect, Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import {pluck, reduce} from 'ramda';

// Actions
import {
    computeGraphs,
    computePaths,
    setLayout,
    triggerDefaultState
} from './actions/index';

// Render the app
import renderTree from './renderTree';

// Stores
import layout from './reducers/layout';
import graphs from './reducers/dependencyGraph';
import paths from './reducers/paths';
import requestQueue from './reducers/requestQueue';
import * as API from './reducers/api';















/*
 * Change the path here to try out different examples.
 * Examples need to export appLayout and mapInputsToOutputs
 * objects.
*/
import {appLayout, mapInputsToOutputs} from './local_examples/example_1_input_to_div';




























/*
 * You shouldn't have to edit anything below here
 * This block below does a few things:
 * - it transforms the API calls into
 *   some promises that call the `transform` method
 *   for the appropriate input-output pair.
 * - it initializes the app without the API controller
 */

const dependenciesRequest = {
    content: mapInputsToOutputs.map(object => {
        object.events = [];
        object.state = [];
        return object;
    }),
    status: 200
};

window.fetch = function(url, options) {
    const payload = JSON.parse(options.body);
    return new Promise(resolveResonse => {
        const inputOutputPair = mapInputsToOutputs.find(pair =>
            (pair.output.id === payload.output.id) &&
            (pair.output.property === payload.output.property)
        );
        resolveResonse({
            status: 200,
            json: () => new Promise(resolveJson => {
                resolveJson({
                    response: {
                        props: {
                            'id': inputOutputPair.output.id,
                            [inputOutputPair.output.property]: (
                                inputOutputPair.output.transform(
                                    reduce(
                                        (acc, input) => {
                                            acc[`${input.id}.${input.property}`] = input.value;
                                            return acc
                                        },
                                        {},
                                        payload.inputs
                                    )
                                )
                            )
                        }
                    }
                })
            })
        })
    });
}


// Initialize a store
const reducer = combineReducers({
    layout,
    graphs,
    paths,
    requestQueue,
    dependenciesRequest: API.dependenciesRequest
});
const logger = createLogger()
let store;
const initializeStore = () => {
    if (store) {
        return store;
    }

    store = createStore(
        reducer,
        applyMiddleware(thunk, logger)
    );

    window.store = store; /* global window:true */

    return store;
};

store = initializeStore();

store.dispatch({
    type: 'dependenciesRequest',
    payload: dependenciesRequest
});
store.dispatch(setLayout(appLayout));
store.dispatch(computePaths({subTree: appLayout, startingPath: []}));
store.dispatch(computeGraphs(dependenciesRequest.content));
store.dispatch(triggerDefaultState);

const ConnectedApp = connect(state => ({
    layout: state.layout,
    dependenciesRequest: state.dependenciesRequest
}))(
    props => {
        return (
            <div>
                {renderTree(props.layout, props.dependenciesRequest.content)}
            </div>
        )
    }
);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedApp/>
    </Provider>,
    document.getElementById('react-entry-point')
);
