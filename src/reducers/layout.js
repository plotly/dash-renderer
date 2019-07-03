import {append, assocPath, contains, lensPath, merge, view, set} from 'ramda';

import {getAction} from '../actions/constants';

const layout = (state = {}, action) => {
    if (action.type === getAction('SET_LAYOUT')) {
        return action.payload;
    } else if (
        contains(action.type, [
            'UNDO_PROP_CHANGE',
            'REDO_PROP_CHANGE',
            getAction('ON_PROP_CHANGE'),
        ])
    ) {
        const propPath = append('props', action.payload.itempath);
        const props = action.payload.props;
        let mergedProps = view(lensPath(propPath), state);

        for (const prop in props) {
            if (props.hasOwnProperty(prop)) {
                mergedProps = set(
                    lensPath(prop.split('.')),
                    props[prop],
                    mergedProps
                );
            }
        }

        return assocPath(propPath, mergedProps, state);
    }

    return state;
};

export default layout;
