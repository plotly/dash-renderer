import {assoc} from 'ramda';
import {ACTIONS} from '../actions/constants';

const shareKey = (state = {}, action) => {
    if (action.type === ACTIONS('SET_SHAREKEY')) {
        return assoc('shareKey', action.payload, state);
    } else {
        return state;
    }
}

export default shareKey;
