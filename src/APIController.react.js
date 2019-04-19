import {connect} from 'react-redux';
import {contains, isEmpty, isNil} from 'ramda';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TreeContainer from './TreeContainer';
import GlobalErrorContainer from './components/error/GlobalErrorContainer.react';
import {
    computeGraphs,
    computePaths,
    hydrateInitialOutputs,
    setLayout,
} from './actions/index';
import {getDependencies, getLayout} from './actions/api';
import {getAppState} from './reducers/constants';
import {STATUS} from './constants/constants';

/**
 * Fire off API calls for initialization
 */
class UnconnectedContainer extends Component {
    constructor(props) {
        super(props);
        this.initialization = this.initialization.bind(this);
        this.state = {
            errorLoading: false,
        };
    }
    componentDidMount() {
        this.initialization(this.props);
    }

    componentWillReceiveProps(props) {
        this.initialization(props);
    }

    initialization(props) {
        const {
            appLifecycle,
            dependenciesRequest,
            dispatch,
            graphs,
            layout,
            layoutRequest,
            paths,
        } = props;

        if (isEmpty(layoutRequest)) {
            dispatch(getLayout());
        } else if (layoutRequest.status === STATUS.OK) {
            if (isEmpty(layout)) {
                dispatch(setLayout(layoutRequest.content));
            } else if (isNil(paths)) {
                dispatch(computePaths({subTree: layout, startingPath: []}));
            }
        }

        if (isEmpty(dependenciesRequest)) {
            dispatch(getDependencies());
        } else if (
            dependenciesRequest.status === STATUS.OK &&
            isEmpty(graphs)
        ) {
            dispatch(computeGraphs(dependenciesRequest.content));
        }

        if (
            // dependenciesRequest and its computed stores
            dependenciesRequest.status === STATUS.OK &&
            !isEmpty(graphs) &&
            // LayoutRequest and its computed stores
            layoutRequest.status === STATUS.OK &&
            !isEmpty(layout) &&
            !isNil(paths) &&
            // Hasn't already hydrated
            appLifecycle === getAppState('STARTED')
        ) {
            let errorLoading = false;
            try {
                dispatch(hydrateInitialOutputs());
            } catch (err) {
                errorLoading = true;
            } finally {
                this.setState(state =>
                    state.errorLoading !== errorLoading ? {errorLoading} : null
                );
            }
        }
    }

    render() {
        const {
            appLifecycle,
            dependenciesRequest,
            layoutRequest,
            layout,
            config,
        } = this.props;

        const {errorLoading} = this.state;

        if (
            layoutRequest.status &&
            !contains(layoutRequest.status, [STATUS.OK, 'loading'])
        ) {
            return <div className="_dash-error">{'Error loading layout'}</div>;
        } else if (
            errorLoading ||
            (dependenciesRequest.status &&
                !contains(dependenciesRequest.status, [STATUS.OK, 'loading']))
        ) {
            return (
                <div className="_dash-error">
                    {'Error loading dependencies'}
                </div>
            );
        } else if (
            appLifecycle === getAppState('HYDRATED') &&
            config.ui === true
        ) {
            return (
                <GlobalErrorContainer>
                    <TreeContainer
                        _dashprivate_layout={layout}
                        _dashprivate_path={[]}
                    />
                </GlobalErrorContainer>
            );
        } else if (appLifecycle === getAppState('HYDRATED')) {
            return (
                <TreeContainer
                    _dashprivate_layout={layout}
                    _dashprivate_path={[]}
                />
            );
        }

        return <div className="_dash-loading">{'Loading...'}</div>;
    }
}
UnconnectedContainer.propTypes = {
    appLifecycle: PropTypes.oneOf([
        getAppState('STARTED'),
        getAppState('HYDRATED'),
    ]),
    dispatch: PropTypes.func,
    dependenciesRequest: PropTypes.object,
    layoutRequest: PropTypes.object,
    layout: PropTypes.object,
    paths: PropTypes.object,
    history: PropTypes.any,
    error: PropTypes.object,
    config: PropTypes.object,
};

const Container = connect(
    // map state to props
    state => ({
        appLifecycle: state.appLifecycle,
        dependenciesRequest: state.dependenciesRequest,
        layoutRequest: state.layoutRequest,
        layout: state.layout,
        graphs: state.graphs,
        paths: state.paths,
        history: state.history,
        error: state.error,
        config: state.config,
    }),
    dispatch => ({dispatch})
)(UnconnectedContainer);

export default Container;
