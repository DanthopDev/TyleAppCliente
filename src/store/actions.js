import constants from './constants';

export const actionSession = (value) => ({
    type: constants.SESSION,
    value
});

export const actionIsConnected = (value) => ({
    type: constants.ISCONNECTED,
    value
});