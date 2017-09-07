/* global fetch:true, Promise:true, document:true */
import {
    concat,
    contains,
    has,
    intersection,
    isEmpty,
    keys,
    lensPath,
    reject,
    sort,
    type,
    union,
    view
} from 'ramda';
import {createAction} from 'redux-actions';
import {crawlLayout, hasId} from '../reducers/utils';
import {APP_STATES} from '../reducers/constants';
import {ACTIONS} from './constants';
import cookie from 'cookie';
import {urlBase} from '../utils';

export const updateProps = createAction(ACTIONS('ON_PROP_CHANGE'));
export const setRequestQueue = createAction(ACTIONS('SET_REQUEST_QUEUE'));
export const computeGraphs = createAction(ACTIONS('COMPUTE_GRAPHS'));
export const computePaths = createAction(ACTIONS('COMPUTE_PATHS'));
export const setLayout = createAction(ACTIONS('SET_LAYOUT'));
export const setAppLifecycle = createAction(ACTIONS('SET_APP_LIFECYCLE'));
export const readConfig = createAction(ACTIONS('READ_CONFIG'));

export function hydrateInitialOutputs() {
    return function (dispatch, getState) {
        triggerDefaultState(dispatch, getState);
        dispatch(setAppLifecycle(APP_STATES('HYDRATED')));
    }
}


function triggerDefaultState(dispatch, getState) {
    const {graphs} = getState();
    const {InputGraph} = graphs;
    const allNodes = InputGraph.overallOrder();
    allNodes.reverse();
    allNodes.forEach(nodeId => {
        const [componentId, componentProp] = nodeId.split('.');

        /*
         * Filter out the outputs,
         * inputs that aren't leaves,
         * and the invisible inputs
         */
        if (InputGraph.dependenciesOf(nodeId).length > 0 &&
            InputGraph.dependantsOf(nodeId).length == 0 &&
            has(componentId, getState().paths)
        ) {

            // Get the initial property
            const propLens = lensPath(
                concat(getState().paths[componentId],
                ['props', componentProp]
            ));
            const propValue = view(
                propLens,
                getState().layout
            );

            dispatch(notifyObservers({
                id: componentId,
                props: {[componentProp]: propValue}
            }));

        }
    });
}

export function redo() {
    return function (dispatch, getState) {
        const history = getState().history;
        dispatch(createAction('REDO')());
        const next = history.future[0];

        // Update props
        dispatch(createAction('REDO_PROP_CHANGE')({
            itempath: getState().paths[next.id],
            props: next.props
        }));

        // Notify observers
        dispatch(notifyObservers({
            id: next.id,
            props: next.props
        }));
    }
}


export function undo() {
    return function (dispatch, getState) {
        const history = getState().history;
        dispatch(createAction('UNDO')());
        const previous = history.past[history.past.length - 1];

        // Update props
        dispatch(createAction('UNDO_PROP_CHANGE')({
            itempath: getState().paths[previous.id],
            props: previous.props
        }));

        // Notify observers
        dispatch(notifyObservers({
            id: previous.id,
            props: previous.props
        }));
    }
}




export function notifyObservers(payload) {
    return function (dispatch, getState) {
        const {
            id,
            event,
            props
        } = payload

        const {
            config,
            layout,
            graphs,
            paths,
            requestQueue,
            dependenciesRequest
        } = getState();
        const {EventGraph, InputGraph} = graphs;

        /*

         * Figure out all of the output id's that depend on this
         * event or input.
         * This includes id's that are direct children as well as
         * grandchildren.
         * grandchildren will get filtered out in a later stage.
         */
        let outputObservers;
        if (event) {
            outputObservers = EventGraph.dependenciesOf(`${id}.${event}`);
        } else {
            const changedProps = keys(props);
            outputObservers = [];
            changedProps.forEach(propName => {
                const node = `${id}.${propName}`
                if (!InputGraph.hasNode(node)) {
                    return;
                }
                InputGraph.dependenciesOf(node).forEach(outputId => {
                    outputObservers.push(outputId);
                });
            });
        }

        if (isEmpty(outputObservers)) {
            return;
        }

        /*
         * There may be several components that depend on this input.
         * And some components may depend on other components before
         * updating. Get this update order straightened out.
         */
        const depOrder = InputGraph.overallOrder();
        outputObservers = sort(
            (a, b) => depOrder.indexOf(b) - depOrder.indexOf(a),
            outputObservers
        );
        const queuedObservers = [];
        outputObservers.forEach(function filterObservers(outputIdAndProp) {
            const outputComponentId = outputIdAndProp.split('.')[0];

            /*
             * before we make the POST to update the output, check
             * that the output doesn't depend on any other inputs that
             * that depend on the same controller.
             * if the output has another input with a shared controller,
             * then don't update this output yet.
             * when each dependency updates, it'll dispatch its own
             * `notifyObservers` action which will allow this
             * component to update.
             *
             * for example, if A updates B and C (A -> [B, C]) and B updates C
             * (B -> C), then when A updates, this logic will
             * reject C from the queue since it will end up getting updated
             * by B.
             *
             * in this case, B will already be in queuedObservers by the time
             * this loop hits C because of the overallOrder sorting logic
             */


             /*
              * if the output just listens to events, then it won't be in
              * the InputGraph
              */
            const controllers = (InputGraph.hasNode(outputIdAndProp) ?
                InputGraph.dependantsOf(outputIdAndProp) : []);

            const controllersInFutureQueue = intersection(
                queuedObservers,
                controllers
            );

            /*
             * check that the output hasn't been triggered to update already
             * by a different input.
             *
             * for example:
             * Grandparent -> [Parent A, Parent B] -> Child
             *
             * when Grandparent changes, it will trigger Parent A and Parent B
             * to each update Child.
             * one of the components (Parent A or Parent B) will queue up
             * the change for Child. if this update has already been queued up,
             * then skip the update for the other component
             */
            const isAlreadyInQueue = contains(outputIdAndProp, requestQueue);
            const controllersInExistingQueue = intersection(
                requestQueue, controllers
            );

            /*
             * also check that this observer is actually in the current
             * component tree.
             * observers don't actually need to be rendered at the moment
             * of a controller change.
             * for example, perhaps the user has hidden one of the observers
             */
             if (
                 (controllersInFutureQueue.length === 0) &&
                 (has(outputComponentId, getState().paths)) &&
                 (controllersInExistingQueue.length === 0) &&
                 !isAlreadyInQueue
             ) {
                 queuedObservers.push(outputIdAndProp)
             }
        });

        /*
         * record the set of output IDs that will eventually need to be
         * updated in a queue. not all of these requests will be fired in this
         * action
         */
        dispatch(setRequestQueue(union(queuedObservers, requestQueue)));

        const promises = [];
        for (let i = 0; i < queuedObservers.length; i++) {
            const outputIdAndProp = queuedObservers[i];
            const [outputComponentId, outputProp] = outputIdAndProp.split('.');

            /*
             * Construct a payload of the input, state, and event.
             * For example:
             * If the input triggered this update, then:
             * {
             *      inputs: [{'id': 'input1', 'property': 'new value'}],
             *      state: [{'id': 'state1', 'property': 'existing value'}]
             * }
             *
             * If an event triggered this udpate, then:
             * {
             *      state: [{'id': 'state1', 'property': 'existing value'}],
             *      event: {'id': 'graph', 'event': 'click'}
             * }
             *
             */
             const payload = {
                 output: {id: outputComponentId, property: outputProp}
             };

             if (event) {
                 payload.event = event;
             }

            const {inputs, state} = dependenciesRequest.content.find(
                dependency => (
                    dependency.output.id === outputComponentId &&
                    dependency.output.property === outputProp
                )
            )
            if (inputs.length > 0) {
                payload.inputs = inputs.map(inputObject => {
                    const propLens = lensPath(
                        concat(paths[inputObject.id],
                        ['props', inputObject.property]
                    ));
                    return {
                        id: inputObject.id,
                        property: inputObject.property,
                        value: view(propLens, layout)
                    };
                });
            }
            if (state.length > 0) {
                payload.state = state.map(stateObject => {
                    const propLens = lensPath(
                        concat(paths[stateObject.id],
                        ['props', stateObject.property]
                    ));
                    return {
                        id: stateObject.id,
                        property: stateObject.property,
                        value: view(propLens, layout)
                    };
                });
            }

            promises.push(fetch(`${urlBase(config)}_dash-update-component`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': cookie.parse(document.cookie)._csrf_token
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            }).then(function handleResponse(res) {
                dispatch({
                    type: 'lastUpdateComponentRequest',
                    payload: {status: res.status}
                });

                // clear this item from the request queue
                dispatch(setRequestQueue(
                    reject(
                        id => id === outputIdAndProp,
                        getState().requestQueue
                    )
                ));


                    /*
                     * it's possible that this output item is no longer visible.
                     * for example, the could still be request running when
                     * the user switched the chapter
                     *
                     * if it's not visible, then ignore the rest of the updates
                     * to the store
                     */
                    if (!has(outputComponentId, getState().paths)) {
                        return;
                    }

                    // and update the props of the component
                    const observerUpdatePayload = {
                        itempath: getState().paths[outputComponentId],
                        // new prop from the server
                        props: data.response.props,
                        source: 'response'
                    };
                    dispatch(updateProps(observerUpdatePayload));

                    dispatch(notifyObservers({
                        id: outputComponentId,
                        props: data.response.props
                    }));

                    /*
                     * If the response includes children, then we need to update our
                     * paths store.
                     * TODO - Do we need to wait for updateProps to finish?
                     */
                    if (has('children', observerUpdatePayload.props)) {

                        dispatch(computePaths({
                            subTree: observerUpdatePayload.props.children,
                            startingPath: concat(
                                getState().paths[outputComponentId],
                                ['props', 'children']
                            )
                        }));

                        /*
                         * if children contains objects with IDs, then we
                         * need to dispatch a propChange for all of these
                         * new children components
                         */
                        if (contains(
                                type(observerUpdatePayload.props.children),
                                ['Array', 'Object']
                            ) && !isEmpty(observerUpdatePayload.props.children)
                        ) {
                            /*
                             * TODO: We're just naively crawling
                             * the _entire_ layout to recompute the
                             * the dependency graphs.
                             * We don't need to do this - just need
                             * to compute the subtree
                             */
                            const newProps = [];
                            crawlLayout(
                                observerUpdatePayload.props.children,
                                function appendIds(child) {
                                    if (hasId(child)) {
                                        keys(child.props).forEach(childProp => {
                                            const inputId = (
                                                `${child.props.id}.${childProp}`
                                            );
                                            if (has(inputId, InputGraph.nodes)) {
                                                newProps.push({
                                                    id: child.props.id,
                                                    props: {
                                                        [childProp]: child.props[childProp]
                                                    }
                                                });
                                            }
                                        })
                                    }
                                }
                            );

                            const depOrder = InputGraph.overallOrder();
                            const sortedNewProps = sort((a, b) =>
                                depOrder.indexOf(a.id) - depOrder.indexOf(b.id),
                                newProps
                            );

                            /*
                             * TODO - As in the case of Jack Luo's indicator app,
                             * all of these inputs could update a _single_ output.
                             * If that is the case, then we can collect all of their
                             * values and make a single request instead of making a
                             * different request for each input
                             */
                            sortedNewProps.forEach(function(propUpdate) {
                                dispatch(notifyObservers(propUpdate));
                            });

                        }


                    }

            })}));

        }

        return Promise.all(promises);
    }
}

export function serialize(state) {
    // Record minimal input state in the url
    const {graphs, paths, layout} = state;
    const {InputGraph} = graphs;
    const allNodes = InputGraph.nodes;
    const savedState = {};
    keys(allNodes).forEach(nodeId => {
        const [componentId, componentProp] = nodeId.split('.');
        /*
         * Filter out the outputs,
         * and the invisible inputs
         */
        if (InputGraph.dependenciesOf(nodeId).length > 0 &&
            has(componentId, paths)
        ) {
            // Get the property
            const propLens = lensPath(
                concat(paths[componentId],
                ['props', componentProp]
            ));
            const propValue = view(
                propLens,
                layout
            );
            savedState[nodeId] = propValue;
        }
    });

    return savedState;

}
