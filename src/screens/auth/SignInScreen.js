import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TextInput, KeyboardAvoidingView, Linking, TouchableOpacity, StatusBar} from 'react-native';
import Colors from '../../constants/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import { AvenirHeavy, AvenirMedium } from '../../components/StyledText'; 
import SharedStyle from "../../constants/SharedStyle";
import PasswordTextInput from '../../components/PasswordTextInput';
import CustomAlert from '../../components/CustomAlert';
import { getUserInfoApi, logIn } from '../../utils/APIs';
import { _storeData } from '../../utils/storange';
import { actionSession } from '../../store/actions';
import { connect } from 'react-redux';
import { checkPermission } from '../../utils/firebase';

class SignInScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
        email: '',
        password: '',
        isLoading: false,
        isVisibleAlert: false,
        message: '',
    };
    this.focusNextField = this.focusNextField.bind(this);
    this.inputs = {};
  }
  
  static navigationOptions = {
        header: () => {
            return null;
        }
    };

  onValidate = () => {
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const {  email, password }=this.state;
      if(email=='' && password==''){
          this.setState({
              isVisibleAlert: true,
              message: 'Ingresa tu email y contraseña, para iniciar sesión es necesario ingresar estos campos',
          });
      } else if(email==''){
          this.setState({
              isVisibleAlert: true,
              message: 'Ingresa tu email, para iniciar sesión es necesario ingresar tu email',
          });
      } else if(!regex.test(email.trim())){
          this.setState({
              isVisibleAlert: true,
              message: 'Formato de email invalido, asegurate de ingresar correctamente tu email',
          });
      } else if(password==''){
          this.setState({
              isVisibleAlert: true,
              message: 'Ingresa tu contraseña, para iniciar sesión es necesario ingresar tu contraseña',
          });
      } else {
          if(this.props.isConnected){
              this.setState({
                  isLoading: true,
                  isVisibleAlert: true,
                  message: 'Iniciando sesión...',
              });
              this.login();
          }else {
              this.setState({
                  isVisibleAlert: true,
                  message: 'Sin conexión a internet, intente de nuevo asegurandose de tener acceso a internet',
              });
          } 
      }
  }
  
  login= () => {
      const { email, password }=this.state;
      logIn(email, password).then((responseAccess) => {
            if(responseAccess.access){
                let access = responseAccess.access;
                /*console.log('=========== Access Token =======');
                console.log(responseAccess);*/
                if(access.errors){
                    this.setState({
                        isLoading: false,
                        isVisibleAlert: true,
                        message: 'Access Errors, ' + JSON.stringify(access.errors),
                    });
                }else {
                    if (access.message && access.message == 'Unauthorized') {
                        this.setState({
                            isLoading: false,
                            isVisibleAlert: true,
                            message: 'Correo o contraseña incorrectos, asugurese de ingresar correctamente sus credenciales',
                        });
                    }
                    if (access.access_token) {
                        getUserInfoApi(access).then(response => {
                            if (response.user) {
                                if (response.user.message == 'Unauthenticated.') {
                                    this.setState({
                                        isLoading: false,
                                        isVisibleAlert: true,
                                        message: 'Log In Error, Get User Api Error 1, Unauthenticated.',
                                    });
                                } else if (response.user.cliente) {
                                    let session = {
                                        user: response.user,
                                        access_token: access.access_token,
                                        token_type: access.token_type
                                    }
                                    checkPermission();
                                    _storeData('@transcliente/userSesion', JSON.stringify(access)).then(result => {
                                        if (result == 'saved') {
                                            this.setState({
                                                isVisibleAlert: false,
                                            });
                                            this.props.setSession(session);
                                            this.props.navigation.navigate('App');
                                        } else {
                                            this.setState({
                                                isLoading: false,
                                                isVisibleAlert: true,
                                                message: 'Error al guardar la sesión en el dispositivo, ' + result,
                                            });
                                        }
                                    });
                                }else{
                                    this.setState({
                                        isLoading: false,
                                        isVisibleAlert: true,
                                        message: 'A ocurrido un error, la cuenta ingresada no es del tipo cliente, asegurese de ingresar con una cuenta valida para la app',
                                    });
                                }
                            } else {
                                this.setState({
                                    isLoading: false,
                                    isVisibleAlert: true,
                                    message: 'Get User Api Error, ' + JSON.stringify(result.error),
                                });
                            }
                        });
                    }
                }
            }else {
                this.setState({
                    isLoading: false,
                    isVisibleAlert: true,
                    message: 'Log In Error, ' + JSON.stringify(responseAccess.error),
                });
            }
        })
  }

    focusNextField(id) {
        this.inputs[id].focus();
    }

  render() {
    const { email, password, isVisibleAlert, message, isLoading } =this.state;
    return (
    <KeyboardAvoidingView style={SharedStyle.container} behavior="padding" enabled keyboardVerticalOffset={-500}>
      <ScrollView style={SharedStyle.container}>
        <View style={styles.imageContainer}>
            <Image
                style={styles.image}
                source={require('../../../assets/images/logo_negro.png')}
            />
            <AvenirHeavy style={SharedStyle.title}>
                ¡Bienvenido Cliente!
            </AvenirHeavy>
        </View>
        <View style={{ flex: 5 }}>
            <AvenirMedium style={SharedStyle.text}>
                Ingresa tu correo
            </AvenirMedium>
            <TextInput
                value={email}
                placeholder={'usuario@mail.com'}
                style={SharedStyle.input}
                onChangeText={(email) => this.setState({ email })}
                autoCompleteType={'email'}
                keyboardType={'email-address'}
                autoCapitalize={'none'}
                maxLength={50}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                    this.focusNextField('two');
                }}
                returnKeyType={"next"}
            />
            <AvenirMedium style={[SharedStyle.text, {marginTop: 30}]}>
                Contraseña
            </AvenirMedium>
            <PasswordTextInput
                value={password}
                placeholder={'escriba aquí'}
                onChangeText={(password) => this.setState({ password })}
                onSubmitEditing={this.onValidate}
                returnKeyType={"done"}
                ref={input => {
                    this.inputs['two'] = input;
                }}
            />
            <TouchableOpacity onPress={() => {
                    Linking.openURL('http://trans247.danthoppruebas.com/password/reset')
                    .catch((err) => console.error('An error occurred by open reset password', err));
            }}>
                <AvenirMedium style={styles.textResetPassword}>
                        ¿Olvidaste tu contraseña?
                </AvenirMedium>
            </TouchableOpacity>
            <View style={styles.buttonsContainer}>
                <PrimaryButton
                    onTouch={this.onValidate}
                    title='Iniciar Sesión'
                />
                <PrimaryButton
                    onTouch={() => this.props.navigation.navigate('SignUp')}
                    title='Registrarse'
                    color={Colors.pink}
                />
            </View>
        </View>
        <CustomAlert
            isVisible={isVisibleAlert}
            message={message}
            isLoading={isLoading}
            confirmText={'Aceptar'}
            onConfirmPressed={() => this.setState({ isVisibleAlert: false }) }
            />
      </ScrollView>
    </KeyboardAvoidingView>
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

export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);

const styles = StyleSheet.create({
    imageContainer: { 
        flex: 4, 
        alignItems: 'center', 
        marginBottom: 20, 
        marginTop: 50 
    },
    image: { 
        width: 240, 
        height: 160, 
        marginBottom: 30,
        resizeMode: 'contain' 
    },
    textResetPassword: {
        color: 'gray',
        textAlign: 'right',
        marginHorizontal: 20,
        marginVertical: 10
    },
    buttonsContainer: {
        flex: 1,
        justifyContent: 'center'
    }
});

