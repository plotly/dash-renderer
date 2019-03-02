'use strict';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Registry from './registry';
import {connect} from 'react-redux';
import {
    contains,
    filter,
    forEach,
    isEmpty,
    isNil,
    keysIn,
    mergeAll,
    omit,
    pick,
    propOr,
    type
} from 'ramda';
import {STATUS} from './constants/constants';
import { notifyObservers, updateProps } from './actions';

function isPlainObject(candidate) {
    return candidate !== undefined &&
        candidate !== null &&
        typeof candidate === 'object' &&
        candidate.constructor === Object;
}

function isEqual(obj1, obj2, deep: boolean = false) {
    return obj1 === obj2 || isEqualArgs(
        Object.values(obj1),
        Object.values(obj2),
        deep
    );
}

function isEqualArgs(args1, args2, deep = false) {
    return (
        !!args1 &&
        args1.length === args2.length &&
        !!args1.every((arg1, index) => {
            const arg2 = args2[index];

            return arg1 === arg2 || (deep && (
                (Array.isArray(arg1) && Array.isArray(arg2) && isEqualArgs(arg1, arg2, deep)) ||
                (isPlainObject(arg1) && isPlainObject(arg2) && isEqual(arg1, arg2, deep))
            ));
        })
    );
}

const SIMPLE_COMPONENT_TYPES = ['String', 'Number', 'Null', 'Boolean'];

function memoizeOne(fn) {
    let lastArgs: any[] | null = null;
    let lastResult: any;

    return (...args) =>
        isEqualArgs(lastArgs, args) ?
            lastResult :
            (lastArgs = args) && (lastResult = fn(...args));
}

class TreeContainer extends PureComponent {
    constructor(props) {
        super(props);

        this.getChildren = memoizeOne(this.getChildren.bind(this));
        this.getComponent = memoizeOne(this.getComponent.bind(this));
        this.getLoadingState = memoizeOne(this.getLoadingState.bind(this));
        this.getSetProps = memoizeOne(this.getSetProps.bind(this));
    }

    getChildren(components) {
        if (!components) {
            return null;
        }

        if (!Array.isArray(components)) {
            return contains(type(components), SIMPLE_COMPONENT_TYPES) ?
                components :
                (<AugmentedTreeContainer
                    key={components && components.props && components.props.id}
                    __dashlayout__={components}
                />);
        }

        return components.map(child => contains(type(child), SIMPLE_COMPONENT_TYPES) ?
            child :
            (<AugmentedTreeContainer
                key={child && child.props && child.props.id}
                __dashlayout__={child}
            />));
    }

    getComponent(__dashlayout__, children, loading_state, setProps) {
        if (isEmpty(__dashlayout__)) {
            return null;
        }

        if (contains(type(__dashlayout__), SIMPLE_COMPONENT_TYPES)) {
            return __dashlayout__;
        }


        if (!__dashlayout__.type) {
            /* eslint-disable no-console */
            console.error(type(__dashlayout__), __dashlayout__);
            /* eslint-enable no-console */
            throw new Error('component.type is undefined');
        }
        if (!__dashlayout__.namespace) {
            /* eslint-disable no-console */
            console.error(type(__dashlayout__), __dashlayout__);
            /* eslint-enable no-console */
            throw new Error('component.namespace is undefined');
        }
        const element = Registry.resolve(__dashlayout__.type, __dashlayout__.namespace);

        return Array.isArray(children) ?
            React.createElement(
                element,
                mergeAll([
                    omit(['children'], __dashlayout__.props),
                    { loading_state, setProps }
                ]),
                ...children
            ) :
            React.createElement(
                element,
                mergeAll([
                    omit(['children'], __dashlayout__.props),
                    { loading_state, setProps }
                ]),
                ...[children]
            );
    }

    getLoadingState(id, requestQueue) {
        // loading prop coming from TreeContainer
        let isLoading = false;
        let loadingProp;
        let loadingComponent;

        if (requestQueue && requestQueue.filter) {
            forEach(r => {
                const controllerId = isNil(r.controllerId) ? '' : r.controllerId;
                if (r.status === 'loading' && contains(id, controllerId)) {
                    isLoading = true;
                    [loadingComponent, loadingProp] = r.controllerId.split('.');
                }
            }, requestQueue);

            const thisRequest = requestQueue.filter(r => {
                const controllerId = isNil(r.controllerId) ? '' : r.controllerId;
                return contains(id, controllerId);
            });
            if (thisRequest.status === STATUS.OK) {
                isLoading = false;
            }
        }

        // Set loading state
        return {
            is_loading: isLoading,
            prop_name: loadingProp,
            component_name: loadingComponent,
        };
    }

    getSetProps() {
        return newProps => {
            const { dependencies, dispatch, paths } = this.props;
            const id = this.getLayoutProps().id;

            // Identify the modified props that are required for callbacks
            const watchedKeys = filter(key =>
                dependencies &&
                dependencies.find(dependency =>
                    dependency.inputs.find(input => input.id === id && input.property === key) ||
                    dependency.state.find(state => state.id === id && state.property === key)
                )
            )(keysIn(newProps));

            // Always update this component's props
            dispatch(updateProps({
                props: newProps,
                id: id,
                itempath: paths[id]
            }));

            // Only dispatch changes to Dash if a watched prop changed
            if (watchedKeys.length) {
                dispatch(notifyObservers({
                    id: id,
                    props: pick(watchedKeys)(newProps)
                }));
            }

        };
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.__dashlayout__ !== this.props.__dashlayout__;
    }

    getLayoutProps() {
        return propOr({}, 'props', this.props.__dashlayout__);
    }

    render() {
        const { dispatch, __dashlayout__, requestQueue } = this.props;
        const layoutProps = this.getLayoutProps();

        const children = this.getChildren(layoutProps.children);
        const loadingState = this.getLoadingState(layoutProps.id, requestQueue);
        const setProps = this.getSetProps(dispatch);

        return this.getComponent(__dashlayout__, children, loadingState, setProps);
    }
}

TreeContainer.propTypes = {
    dependencies: PropTypes.any,
    dispatch: PropTypes.func,
    __dashlayout__: PropTypes.object,
    paths: PropTypes.any,
    requestQueue: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
    return { dispatch };
}

function mapStateToProps(state) {
    return {
        dependencies: state.dependenciesRequest.content,
        paths: state.paths,
    };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
    return {
        dependencies: stateProps.dependencies,
        dispatch: dispatchProps.dispatch,
        __dashlayout__: ownProps.__dashlayout__,
        loading: ownProps.loading,
        paths: stateProps.paths,
        requestQueue: stateProps.requestQueue,
    };
}

export const AugmentedTreeContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps)(TreeContainer);

export default AugmentedTreeContainer;
