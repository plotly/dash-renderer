/* global window:true */

import R from 'ramda';
import React, {Component, PropTypes} from 'react';
import Registry from './registry';
//import {NotifyObservers} from './components/core/NotifyObservers.react';

/* global window:true */
import {connect} from 'react-redux';
import {isEmpty} from 'ramda';
//import {notifyObservers, updateProps} from '../../actions';
import {notifyObservers, updateProps} from './actions';
//import React, {PropTypes} from 'react';
//import {render} from '../../TreeContainer.js';
window.render = render;


var reactDocs = require('react-docgen');

window.reactDocs = reactDocs;


export default class TreeContainer extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.layout !== this.props.layout;
    }

    render() {
        return render(this.props.layout);
    }
}

TreeContainer.propTypes = {
    layout: PropTypes.object,
}

export function render(component) {
    if (R.contains(R.type(component), ['String', 'Number', 'Null'])) {
        return component;
    }

    // Create list of child elements
    let children;

    const componentProps = R.propOr({}, 'props', component);

    if (!R.has('props', component) ||
        !R.has('children', component.props) ||
        typeof component.props.children === 'undefined') {

        // No children
        children = [];

    } else if (R.contains(
        R.type(component.props.children),
        ['String', 'Number', 'Null'])
    ) {

        children = [component.props.children];

    } else {

        // One or multiple objects
        // Recursively render the tree
        // TODO - I think we should pass in `key` here.
        children = (Array.isArray(componentProps.children) ?
                    componentProps.children : [componentProps.children])
                    .map(render);

    }

    if (!component.type) {
        /* eslint-disable no-console */
        console.error(R.type(component), component);
        /* eslint-enable no-console */
        throw new Error('component.type is undefined');
    }
    if (!component.namespace) {
        /* eslint-disable no-console */
        console.error(R.type(component), component);
        /* eslint-enable no-console */
        throw new Error('component.namespace is undefined');
    }
    const element = Registry.resolve(component.type, component.namespace);

    const parent = React.createElement(
        element,
        R.omit(['children'], component.props),
        ...children
    );

    return (
        <NotifyObservers id={componentProps.id}>
            {parent}
        </NotifyObservers>
    );
}

render.propTypes = {
    children: PropTypes.object
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
    return {
        id: ownProps.id,
        children: ownProps.children,
        dependencies: stateProps.dependencies,
        paths: stateProps.paths,

        fireEvent: function fireEvent({event}) {
            // Update this component's observers with the updated props
            dispatch(notifyObservers({event, id: ownProps.id}));
        },

        setProps: function setProps(newProps) {
            const payload = {
                props: newProps,
                id: ownProps.id,
                itempath: stateProps.paths[ownProps.id]
            };

            // Update this component's props
            dispatch(updateProps(payload));

            // Update output components that depend on this input
            dispatch(notifyObservers({id: ownProps.id, props: newProps}));
        }
    }

}

function NotifyObserversComponent ({
    children,
    id,
    paths,

    dependencies,

    fireEvent,
    setProps
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
    const extraProps = {};
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
    extraProps.render = componentJson => {
        // TODO - check if it's already react component
        // TODO - we  could push all of the recursive rendering
        // to the components and their children
        return render(componentJson);
    };

    if (!isEmpty(extraProps)) {
        return React.cloneElement(children, extraProps);
    } else {
        return children;
    }
}

NotifyObserversComponent.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    path: PropTypes.array.isRequired
};

export const NotifyObservers = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(NotifyObserversComponent);
