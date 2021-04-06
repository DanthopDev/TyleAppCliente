import React from 'react';
import {
    ActivityIndicator,
    View,
    StyleSheet,
    Text, 
    ImageBackground,
    Image
} from 'react-native';
import Colors from '../../constants/Colors';
import AsyncStorage from '@react-native-community/async-storage';
import { getUserInfoApi } from '../../utils/APIs';
import { _getStoreData } from '../../utils/storange';
import { actionSession } from '../../store/actions';
import { AvenirMedium, AvenirHeavy } from '../../components/StyledText';
import FontAwesomeIcon from '../../components/FontAwesomeIcon';
import { connect } from 'react-redux';
import firebase from 'react-native-firebase';
import { checkPermission } from '../../utils/firebase';
import Layout from '../../constants/Layout';


class AuthLoadingScreen extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this._bootstrapAsync();
        this.createChannel();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.isConnected==false && this.props.isConnected==true){
            this._bootstrapAsync();
        }
    }
    createChannel = () => {
        const channel = new firebase.notifications.Android.Channel(
            'loc_noti_cliente',
            'Notificaciones Generales',
            firebase.notifications.Android.Importance.Max
        ).
        setDescription('Este canal ayuda a desplegar notificaciones locales y remotas')
        .enableVibration(true)
        .setVibrationPattern([400, 800, 600, 800, 800, 800, 1000]);
        firebase.notifications().android.createChannel(channel);
    };

    
    checkPermissionPushNotifications(){
        checkPermission();
    }

    _bootstrapAsync = async () => {
        // Detecta si existe sesión guardada en el dipositivo
        try {
            let access = await _getStoreData('@transcliente/userSesion');
            if (access != null) {
                access = JSON.parse(access);
                    getUserInfoApi(access).then(response => {
                        if (response.user.message == 'Unauthenticated.') {
                            AsyncStorage.clear();
                            this.props.navigation.navigate('Auth');
                        } else {
                            if (response.user) {
                                this.checkPermissionPushNotifications()  // Revisa los permisos para notificaciones push
                                let session = {
                                    user: response.user,
                                    access_token: access.access_token,
                                    token_type: access.token_type
                                }
                                this.props.setSession(session);
                                this.props.navigation.navigate('App');
                            } else {
                                console.log(response.err);
                            }
                        }
                    });
            } else {
                //tapa splash
                this.props.navigation.navigate('Auth');
            }
        }catch(err) {
            console.log(err, 'Ocurrio un error al recuperar del Storage');
        }
        return null;
    };

    // Aquí se renderiza una pagina de loading mientras se realiza la autenticazión 
    render() {
        if(this.props.isConnected==false){
            return (
                <View style={styles.container}>
                        <View style={{ alignItems: 'center' }}>
                            <FontAwesomeIcon name={'warning'} size={120} color={'lightgray'} />
                            <AvenirMedium style={styles.text}>Sin conexión a internet</AvenirMedium>
                        </View>
                </View>
            ); 
        }
        return (
           <View style={{ flex: 1 }}>
               <View style={{ flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center'}}>
                    <Image
                        source={require('../../../assets/images/logo_blanco.png')}
                        style={{ height: 200, width: Layout.window.width }}
                        resizeMode={'contain'}
                    />
               </View>
               <View style={{ alignItems: 'center', position: 'absolute', bottom: 37, width: '100%' }}>
                    <ActivityIndicator size={'large'} />
                    <AvenirHeavy style={{ fontSize: 16, color: 'white', letterSpacing: 3 }}>CLIENTE</AvenirHeavy>
               </View>
               <View style={{ backgroundColor: Colors.pink, height: 30 }}/>
           </View>
        );
        
    }
}

const mapStateToProps = state => ({
    session: state.reducerSession,
    isConnected: state.reducerIsConnected,
});

const mapDispatchToProps = dispatch => ({
    setSession: (value) => {
        dispatch(actionSession(value));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthLoadingScreen);
/*
<View style={styles.container}>
                { this.props.isConnected ? this.renderLoading():
                    <View style={{alignItems: 'center'}}>
                        <FontAwesomeIcon name={'warning'} size={120} color={'lightgray'} />
                        <AvenirMedium style={styles.text}>Sin conexión a internet</AvenirMedium>
                    </View> }
            </View>
*/
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background
    },
    text: {
        marginTop: 20,
        fontSize: 20,
        textAlign: 'center',
        lineHeight: 26,
        color: 'lightgray'
    }
});