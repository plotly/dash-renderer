
const customHooks = (state = {request_pre: null, request_post: null}, action) => {
    switch (action.type) {
        case 'SET_HOOKS':
            return (action.payload);
        default:
            return state;
    }
}

export default customHooks;
