import {connect} from 'react-redux';
import {filter, keysIn, pick} from 'ramda';
import {notifyObservers, updateProps} from '../../actions';
import React from 'react';
import PropTypes from 'prop-types';

/*
 * NotifyObservers passes a connected `setProps` handler down to
 * its child as a prop
 */

function mapStateToProps(state) {
    return {
        dependencies: state.dependenciesRequest.content,
        paths: state.paths,
    };
}

function mapDispatchToProps(dispatch) {
    return {dispatch};
}

function mergeProps(stateProps, dispatchProps, ownProps) {
    const { dispatch } = dispatchProps;

    return {
        id: ownProps.id,
        children: ownProps.children,
        dependencies: stateProps.dependencies,
        paths: stateProps.paths,

        setProps: function setProps(newProps) {
            // Identify the modified props that are required for callbacks
            const watchedKeys = filter(key =>
                stateProps.dependencies &&
                stateProps.dependencies.find(dependency =>
                    dependency.inputs.find(input => input.id === ownProps.id && input.property === key) ||
                    dependency.state.find(state => state.id === ownProps.id && state.property === key)
                )
            )(keysIn(newProps));

            // Always update this component's props
            dispatch(updateProps({
                props: newProps,
                id: ownProps.id,
                itempath: stateProps.paths[ownProps.id]
            }));

            // Only dispatch changes to Dash if a watched prop changed
            if (watchedKeys.length) {
                dispatch(notifyObservers({
                    id: ownProps.id,
                    props: pick(watchedKeys)(newProps)
                }));
            }

        },
    };
}

function NotifyObserversComponent({children, setProps}) {
    return React.cloneElement(children, {setProps});
}

NotifyObserversComponent.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    path: PropTypes.array.isRequired,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(NotifyObserversComponent);
