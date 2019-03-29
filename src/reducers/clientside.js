import {getAction} from '../actions/constants';

const initialMapping = null;

/*
 * Mapping between output ID.props and function meta
 */
const clientside = (state = initialMapping, action) => {
    switch (action.type) {
        case getAction('SET_CLIENTSIDE_MAPPING'): {
            return action.payload;
        }

        default: {
            return state;
        }
    }
};

export default clientside;
