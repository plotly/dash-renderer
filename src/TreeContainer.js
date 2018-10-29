'use strict';

import R from 'ramda';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Registry from './registry';
import NotifyObservers from './components/core/NotifyObservers.react';

function isComponent(c) {
    switch (R.type(c)) {
        case 'Array':
            return R.any(isComponent)(c);
        case 'Object':
            return (
                c.hasOwnProperty('namespace') &&
                c.hasOwnProperty('props') &&
                c.hasOwnProperty('type')
            );
        default:
            return false;
    }
}

function hydrateProps(props) {
    const replace = {};
    Object.entries(props)
        .filter(([_, v]) => isComponent(v))
        .forEach(([k, v]) => {
            if (R.type(v) === 'Array') {
                // TODO add key ?.
                replace[k] = v.map(c => {
                    if (!isComponent(c)) {
                        return c;
                    }
                    const newProps = hydrateProps(c.props);
                    return hydrateComponent(
                        c.type,
                        c.namespace,
                        newProps
                    );
                });
            } else {
                const newProps = hydrateProps(v.props);
                replace[k] = hydrateComponent(
                    v.type,
                    v.namespace,
                    newProps
                );
            }
        });
    return R.merge(props, replace);
}

function hydrateComponent(
    component_name,
    namespace,
    props,
) {
    const element = Registry.resolve(component_name, namespace);

    const component = React.createElement(
        element,
        props
    );

    // eslint-disable-next-line
    return <NotifyObservers id={props.id}>{component}</NotifyObservers>;
}

export default class TreeContainer extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.layout !== this.props.layout;
    }

    render() {
        const { layout } = this.props;
        if (
            R.contains(R.type(layout), ['String', 'Number', 'Null', 'Boolean'])
        ) {
            return layout;
        }

        return hydrateComponent(
            layout.type,
            layout.namespace,
            hydrateProps(layout.props)
        );
    }
}

TreeContainer.propTypes = {
    layout: PropTypes.object,
};
