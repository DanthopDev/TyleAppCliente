import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import MainNavigator from './navigation/MainNavigator';
import NetInfo from "@react-native-community/netinfo";
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import { connect } from 'react-redux';
import { actionIsConnected } from './store/actions';
import Colors from './constants/Colors';

const AppContainer = ({
    setConnection
}) => {
    useEffect(() => {
        NetInfo.addEventListener(state => {
            /*console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);}*/
            setConnection(state.isConnected);
            if (state.isConnected == false) {
                showMessage({
                    message: "Sin conexión a internet",
                    description: "Verifica que estes conectado a internet",
                    type: "danger",
                    duration: 5000,
                    backgroundColor: Colors.pink,
                    textStyle: { fontFamily: 'AvenirLTStd-Medium', textAlign: 'center' },
                    titleStyle: { fontFamily: 'AvenirLTStd-Heavy', textAlign: 'center' }
                });
            }
        });
    });
    return (
    <>
        <MainNavigator />
        <FlashMessage position="bottom" />
    </>
)
};

const mapStateToProps = state => ({
    isConnected: state.reducerIsConnected,
});

const mapDispatchToProps = dispatch => ({
    setConnection: (value) => {
        dispatch(actionIsConnected(value));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
