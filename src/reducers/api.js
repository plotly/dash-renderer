import {assoc, assocPath, merge} from 'ramda';

export default function createApiReducer(store) {
    return function ApiReducer(state = {}, action) {
        let newState = state;
        if (action.type === store) {
            const {payload} = action;
            const {id, status, content} = payload;
            const newRequest = {status, content};

            if (Array.isArray(id)) {
                newState = assocPath(id, newRequest, state);
            } else if (id) {
                newState = assoc(id, newRequest, state);
            } else {
                newState = merge(state, newRequest);
            }
        }
        return newState;
    };
}
