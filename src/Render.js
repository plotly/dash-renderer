import * as R from 'ramda';
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {notifyObservers, updateProps} from './actions';
import Registry from './registry';

function render(componentJson) {
    if (R.type(componentJson) === 'Object' &&
        R.has('type', componentJson) &&
        R.has('namespace', componentJson) &&
        R.has('props', componentJson)
    ) {
        return <NotifyObservers {...componentJson}/>;
    } else if (R.type(componentJson) === 'Array') {
        return componentJson.map(render);
    } else {
        // number, boolean, string, null, array, undefined,
        // or an Object that doesn't have the component keys
        // (assumed to be a react object)
        return componentJson;
    }
}



/*
 * NotifyObservers passes a connected `setProps` handler down to
 * its child as a prop
 */

function mapStateToProps (state) {
    return {
        dependencies: state.dependenciesRequest.content,
        paths: state.paths
    };
}

function mapDispatchToProps (dispatch) {
    return {dispatch};
}

function mergeProps(stateProps, dispatchProps, ownProps) {
    const {dispatch} = dispatchProps;
    const id = R.view(R.lensPath(['props', 'id']), ownProps);
    return {
        id: id,
        dependencies: stateProps.dependencies,
        paths: stateProps.paths,

        fireEvent: function fireEvent({event}) {
            // Update this component's observers with the updated props
            dispatch(notifyObservers({event, id: id}));
        },

        setProps: function setProps(newProps) {
            const payload = {
                props: newProps,
                id: id,
                itempath: stateProps.paths[id]
            };

            // Update this component's props
            dispatch(updateProps(payload));

            // Update output components that depend on this input
            dispatch(notifyObservers({id: id, props: newProps}));
        },

        componentJson: ownProps
    }

}


function NotifyObserversComponent({
    id,

    paths,
    dependencies,

    fireEvent,
    setProps,

    componentJson
}) {
    const thisComponentTriggersEvents = (
        dependencies && dependencies.find(dependency => (
            dependency.events.find(event => event.id === id)
        ))
    );
    const thisComponentSharesState = (
        dependencies && dependencies.find(dependency => (
            dependency.inputs.find(input => input.id === id) ||
            dependency.state.find(state => state.id === id)
        ))
    );
    /*
     * Only pass in `setProps` and `fireEvent` if they are actually
     * necessary.
     * This allows component authors to skip computing data
     * for `setProps` or `fireEvent` (which can be expensive)
     * in the case when they aren't actually used.
     * For example, consider `hoverData` for graphs. If it isn't
     * actually used, then the component author can skip binding
     * the events for the component.
     *
     * TODO - A nice enhancement would be to pass in the actual events
     * and properties that are used into the component so that the
     * component author can check for something like `subscribed_events`
     * or `subscribed_properties` instead of `fireEvent` and `setProps`.
     */
    const extraProps = {render};
    if (thisComponentSharesState &&

        // there is a bug with graphs right now where
        // the restyle listener gets assigned with a
        // setProps function that was created before
        // the item was added. only pass in setProps
        // if the item's path exists for now.
        paths[id]
    ) {
        extraProps.setProps = setProps;
    }
    if (thisComponentTriggersEvents && paths[id]) {
        extraProps.fireEvent = fireEvent;
    }
    extraProps.render = render;

    const allProps = R.merge(componentJson.props, extraProps);

    const element = Registry.resolve(
        componentJson.type, componentJson.namespace);

    return React.createElement(
        element,
        allProps
    );
}


NotifyObserversComponent.propTypes = {
    id: PropTypes.string,

    paths: PropTypes.object,
    dependencies: PropTypes.object,

    fireEvent: PropTypes.func,
    setProps: PropTypes.func,

    componentJson: PropTypes.object // oneOf?
}


const NotifyObservers = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(NotifyObserversComponent);

export default NotifyObservers;
