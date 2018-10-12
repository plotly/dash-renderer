'use strict';

import R from 'ramda';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Registry from './registry';
import NotifyObservers from './components/core/NotifyObservers.react';

export default class TreeContainer extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.layout !== this.props.layout;
    }

    render() {
        console.log('layout:', this.props.layout);
        return recursivelyRender(this.props.layout, this.props.loading);
    }
}

TreeContainer.propTypes = {
    layout: PropTypes.object,
    loading: PropTypes.bool
};

function recursivelyRender(component, loading = false) {
    if(R.isEmpty(component)) {
        return <div>Empty</div>;
    }
    if (
        R.contains(R.type(component), ['String', 'Number', 'Null', 'Boolean'])
    ) {
        return component;
    }

    // Create list of child elements
    let children;

    const componentProps = R.propOr({}, 'props', component);

    if (
        !R.has('props', component) ||
        !R.has('children', component.props) ||
        typeof component.props.children === 'undefined'
    ) {
        // No children
        children = [];
    } else if (
        R.contains(R.type(component.props.children), [
            'String',
            'Number',
            'Null',
            'Boolean',
        ])
    ) {
        children = [component.props.children];
    } else {
        // One or multiple objects
        // Recursively render the tree
        // TODO - I think we should pass in `key` here.
        children = (Array.isArray(componentProps.children)
            ? componentProps.children
            : [componentProps.children]
        ).map(child => {
            return recursivelyRender(child, loading);
        });
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

    return <NotifyObservers id={componentProps.id} loading={loading}>{parent}</NotifyObservers>;
}

recursivelyRender.propTypes = {
    children: PropTypes.object,
};
