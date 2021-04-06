import { createStore, combineReducers, applyMiddleware } from 'redux';
import constants from './constants';

const reducerSession = (state = null, action) => {
    switch (action.type) {
        case constants.SESSION:
            return action.value;
        default:
            return state;
    }
}

const reducerIsConnected = (state = null, action) => {
    switch (action.type) {
        case constants.ISCONNECTED:
            return action.value;
        default:
            return state;
    }
}


const reducers = combineReducers({
    reducerSession,
    reducerIsConnected
});

//Store 
const store = createStore(reducers);


export default store;
