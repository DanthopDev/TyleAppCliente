import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
import { saveDeviceTokenApi } from './APIs';
import { showMessage, hideMessage } from "react-native-flash-message";
import Colors from '../constants/Colors';
import store from '../store/store';

//1
export const checkPermission= async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
        getFCMToken();
    } else {
        requestPermission();
    }
}

//3
const getFCMToken= async () => {
    let fcmToken = await AsyncStorage.getItem('@transcliente/fcmToken');
    if (!fcmToken) {
        fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
            // Se guarda el token de notificación en el dispositivo
            await AsyncStorage.setItem('@transcliente/fcmToken', fcmToken);
            const isConnected = store.getState().reducerIsConnected;
            if (isConnected) {
                saveDeviceToken(fcmToken);
            }
        }
    }
    console.log('FCM_TOKEN: ', fcmToken);
}

const saveDeviceToken= async (fcmToken) =>{
    const response= await saveDeviceTokenApi(fcmToken);
    if (response.message !='Successfully save fcm token'){
        showMessage({
            message: "Algo salio mal",
            description: "FCM TOKEN, " + response.message,
            type: "danger",
            duration: 3500,
            backgroundColor: Colors.pink,
            textStyle: { fontFamily: 'AvenirLTStd-Medium', textAlign: 'center' },
            titleStyle: { fontFamily: 'AvenirLTStd-Heavy', textAlign: 'center' }
        });
    }
} 

//2
const requestPermission= async () => {
    try {
        await firebase.messaging().requestPermission();
        // User has authorised
        getFCMToken();
    } catch (error) {
        // User has rejected permissions
        console.log('permission rejected');
    }
}