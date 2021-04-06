import React, { Component } from 'react';
import { View, Alert, ScrollView, StyleSheet, TextInput, Image, TouchableOpacity, Linking, KeyboardAvoidingView } from 'react-native';
import { AvenirMedium, AvenirBook } from '../../components/StyledText'; 
import SharedStyle from "../../constants/SharedStyle";
import ImagePicker from 'react-native-image-picker';
import { request, PERMISSIONS } from 'react-native-permissions';
import TextInputMask from 'react-native-text-input-mask';
import PasswordTextInput from '../../components/PasswordTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import CustomAlert from '../../components/CustomAlert';
import Colors from '../../constants/Colors';
import { signUp, getUserInfoApi } from '../../utils/APIs';
import { _storeData } from '../../utils/storange';
import { actionSession } from '../../store/actions';
import { connect } from 'react-redux';
import { checkPermission } from '../../utils/firebase';
import CheckBox from '@react-native-community/checkbox';

class SignUpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      company: '',
      phone: '',
      companyPhone: '',
      companyPhoneExt: '',
      img: {
        uri: null
      },
      email: '',
      password: '',
      confirmPassword: '',
      isVisibleAlert: false,
      message: '',
      isLoading: false,
      isSelected: false
    };
    this.focusNextField = this.focusNextField.bind(this);
    this.inputs = {};
  }

  async requestPermisions() {
      const cameraStatus = await request(
        Platform.select({
          android: PERMISSIONS.ANDROID.CAMERA,
          ios: PERMISSIONS.IOS.CAMERA,
        }));
      const photoLibraryStatus = await request(
        Platform.select({
          android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        }));
      return { cameraStatus, photoLibraryStatus };
  }

  onValidate= () => {
    if(this.state.isSelected === false){
      this.setState({
        isVisibleAlert: true,
        message: 'Acepta las condiciones de uso y aviso de privacidad antes de continuar',
      });
    }else{
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      let regexPass = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{6,16}$/;
      const { name, company, phone, companyPhone, companyPhoneExt, email, password, confirmPassword } = this.state;
      if(name ==''){
        this.setState({
          isVisibleAlert: true,
          message: 'Ingrese su nombre, para realizar el registro es necesario ingresar su nombre completo',
        });
      } else if(company ==''){
        this.setState({
          isVisibleAlert: true,
          message: 'Ingrese el nombre de la empresa a la que pertenece, para realizar el registro es necesaria esta información',
        });
      } else if(phone == '' && companyPhone== '') {
        this.setState({
          isVisibleAlert: true,
          message: 'Ingrese al menos un número de teléfono, para realizar el registro es necesaria esta información',
        });
      } else if (phone != '' && phone.length < 10) {
          this.setState({
            isVisibleAlert: true,
            message: 'Formato de número celular invalido, el número de teléfono ingresado no contiene 10 digitos',
          });
      } else if (companyPhone != '' && companyPhone.length < 10) {
          this.setState({
            isVisibleAlert: true,
            message: 'Formato de número de teléfono de oficina invalido, el número de teléfono ingresado no contiene 10 digitos',
          });
      } else if(email== ''){
        this.setState({
          isVisibleAlert: true,
          message: 'Ingrese su email, para realizar el registro es necesaria esta información',
        });
      } else if(!regex.test(email.trim())){
        this.setState({
          isVisibleAlert: true,
          message: 'Formato de email invalido, asegurate de ingresar correctamente tu email',
        });
      } else if(password== ''){
        this.setState({
          isVisibleAlert: true,
          message: 'Ingrese su contraseña, para realizar el registro es necesaria esta información',
        });
      } else if(!regexPass.test(password.trim())){
        this.setState({
          isVisibleAlert: true,
          message: 'Formato de contraseña incorrecto, la contraseña debe tener entre 6 y 16 caracteres, al menos un dígito, al menos una minúscula y al menos una mayúscula.',
        });
      } else if(confirmPassword== ''){
        this.setState({
          isVisibleAlert: true,
          message: 'Confirme su contraseña, para realizar el registro es necesaria esta información',
        });
      } else if(password.trim()!=confirmPassword.trim()){
        this.setState({
          isVisibleAlert: true,
          message: 'Las contraseñas no coinciden, asegurese de que ingreso la misma contraseña',
        });
      }else {
        if (this.props.isConnected) {
          this.setState({
            isLoading: true,
            isVisibleAlert: true,
            message: 'Realizando el registro...'
          });
          this.signup();
        }else {
          this.setState({
            isVisibleAlert: true,
            message: 'Sin conexión a internet, intente de nuevo asegurandose de tener acceso a internet',
          });
        }
      }
    }
  }

  signup= () => {
    const { name, company, phone, companyPhone, companyPhoneExt, email, password, img, confirmPassword } = this.state;
    signUp(name, company, phone, companyPhone, companyPhoneExt, email, password, img, confirmPassword).then((responseSingUp) => {
      console.log('===========================  SING UP =====================');
      console.log(responseSingUp);
        if (responseSingUp.access){
          let access = responseSingUp.access;
          if (access.access_token) {
            getUserInfoApi(access).then(response => {
              if (response.user.message == 'Unauthenticated.') {
                this.setState({
                  isLoading: false,
                  isVisibleAlert: true,
                  message: 'Sign Up Error, Get User Api Error 1, Unauthenticated.',
                });
              } else {
                if (response.user) {
                  let session = {
                    user: response.user,
                    access_token: access.access_token,
                    token_type: access.token_type
                  }
                  checkPermission();
                  _storeData('@transcliente/userSesion', JSON.stringify(access)).then(result => {
                    if (result == 'saved') {
                      this.setState({
                        isLoading: false
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
                } else {
                  this.setState({
                    isLoading: false,
                    isVisibleAlert: true,
                    message: 'Get User Api Error, ' + JSON.stringify(result.error),
                  });
                }
              }
            });
          }
          if (access.errors) {
            if (access.errors.email == 'El valor del campo email ya está en uso.') {
              this.setState({
                isVisibleAlert: true,
                isLoading: false,
                message: 'El email ingresado ya esta registrado en nuestro sistema, asegurese de ingresar otro email valido o recuperé su contraseña',
              });
            } else {
              this.setState({
                isVisibleAlert: true,
                isLoading: false,
                message: 'API Error, ' + JSON.stringify(access.errors),
              });
            }
          }
        }else{
          this.setState({
            isVisibleAlert: true,
            isLoading: false,
            message: 'Error Sing Up, ' + JSON.stringify(responseSingUp.error),
          });
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({
          isVisibleAlert: true,
          isLoading: false,
          message: 'Error Sing Up 2, ' + JSON.stringify(error),
        });
      });
  }

  pickImage = () => {
        this.requestPermisions().then(statuses => {
          const { cameraStatus, photoLibraryStatus }=statuses;
          if (cameraStatus =='denied'){
            Alert.alert(
            'Permiso de Acceso a Cámara Denegado',
            'Para tomar la fotografía de perfil, es necesario este acceso',
            );
          }else  if(photoLibraryStatus=='denied'){
            Alert.alert(
              'Permiso de Acceso a Galería Denegado',
              'Para seleccionar la fotografía de perfil, es necesario este acceso',
            );
          }else {
            const options = {
              title: 'Seleccione su foto de Perfil',
              takePhotoButtonTitle: 'Tomar Fotografía',
              chooseFromLibraryButtonTitle: 'Escoger de la Biblioteca',
              cancelButtonTitle: 'Cancelar',
              mediaType: 'photo',
              quality: 0.5,
              allowsEditing: true,
            };

            ImagePicker.showImagePicker(options, (response) => {
              if (response.didCancel) {
                //console.log('User cancelled image picker');
              } else if (response.error) {
                //console.log('ImagePicker Error: ', response.error);
              } else if (response.customButton) {
                //console.log('User tapped custom button: ', response.customButton);
              } else {
                const source = { uri: response.uri };
                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                this.setState({
                  img: source,
                });
              }
            });
          }
        });
    }

  focusNextField(id) {
        this.inputs[id].focus();
  }

  render() {
    const { name, company, phone, companyPhone, companyPhoneExt, img, email, password, confirmPassword, message, isVisibleAlert, isLoading }=this.state;
    return (
    <KeyboardAvoidingView style={SharedStyle.container} behavior="padding" enabled keyboardVerticalOffset={-500}>
      <ScrollView style={SharedStyle.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity 
        onPress={this.pickImage}>
        <Image
        style={styles.image} 
        resizeMode={'cover'}
        source={img.uri!=null ? img : require('../../../assets/images/default_user.png')}
        />
      </TouchableOpacity>
      </View>
        <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
          Nombre Completo
        </AvenirMedium>
        <TextInput
          value={name}
          placeholder={'Juan Peréz'}
          style={SharedStyle.input}
          autoCapitalize={'words'}
          onChangeText={(name) => this.setState({ name })}
          maxLength={200}
          blurOnSubmit={false}
          onSubmitEditing={() => {
            this.focusNextField('two');
          }}
          returnKeyType={"next"}
          ref={input => {
            this.inputs['one'] = input;
          }}
        />
        <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
          Tu Empresa
        </AvenirMedium>
        <TextInput
          value={company}
          placeholder={'Company S.A.'}
          style={SharedStyle.input}
          onChangeText={(company) => this.setState({ company })}
          maxLength={200}
          blurOnSubmit={false}
          onSubmitEditing={() => {
            this.focusNextField('three');
          }}
          returnKeyType={"next"}
          ref={input => {
            this.inputs['two'] = input;
          }}
        />
        <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
          Número Celular
        </AvenirMedium>
        <TextInputMask
          value={phone}
          placeholder={'(00) 00 00 00 00'}
          style={SharedStyle.input}
          keyboardType={'number-pad'}
          blurOnSubmit={false}
          onSubmitEditing={() => {
            this.focusNextField('four');
          }}
          returnKeyType={"next"}
          refInput={ref => { 
            this.input = ref
            this.inputs['three'] = ref }}
          onChangeText={(formatted, extracted) => {
            // formatted: +1 (123) 456-78-90
            // extracted: 1234567890
            this.setState({
              phone: extracted
            });
          }}
          mask={"([00]) [00] [00] [00] [00]"}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, width: '100%'}}>
          <View style={{ flex: 1}}>
              <AvenirMedium style={[SharedStyle.text, { marginTop: 20 , marginHorizontal: 0 }]}>
                Teléfono de Oficina
              </AvenirMedium>
              <TextInputMask
                value={companyPhone}
                placeholder={'(00) 00 00 00 00'}
                style={[SharedStyle.input, { marginHorizontal: 0 }]}
                keyboardType={'number-pad'}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  this.focusNextField('five');
                }}
                returnKeyType={"next"}
                refInput={ref => {
                  this.input = ref
                  this.inputs['four'] = ref
                }}
                onChangeText={(formatted, extracted) => {
                  // formatted: +1 (123) 456-78-90
                  // extracted: 1234567890
                  this.setState({
                    companyPhone: extracted
                  });
                }}
                mask={"([00]) [00] [00] [00] [00]"}
              />
          </View>
          <View style={{ width: 80, marginLeft: 20 }}>
              <AvenirMedium style={[SharedStyle.text, { marginTop: 20, marginHorizontal: 0 }]}>
                Ext.
              </AvenirMedium>
              <TextInputMask
                value={companyPhoneExt}
                placeholder={'00000'}
                style={[SharedStyle.input, { marginHorizontal: 0 }]}
                keyboardType={'number-pad'}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  this.focusNextField('six');
                }}
                returnKeyType={"next"}
                refInput={ref => {
                  this.input = ref
                  this.inputs['five'] = ref
                }}
                onChangeText={(formatted, extracted) => {
                  // formatted: +1 (123) 456-78-90
                  // extracted: 1234567890
                  this.setState({
                    companyPhoneExt: extracted
                  });
                }}
                mask={"[00000]"}
              />
          </View>
        </View>
        <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
          Correo Electrónico
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
            this.focusNextField('seven');
          }}
          returnKeyType={"next"}
          ref={input => {
            this.inputs['six'] = input;
          }}
        />
        <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
          Contraseña
        </AvenirMedium>
        <PasswordTextInput
          value={password}
          placeholder={'escriba aquí'}
          onChangeText={(password) => this.setState({ password })}
          maxLength={16}
          blurOnSubmit={false}
          onSubmitEditing={() => {
            this.focusNextField('eight');
          }}
          returnKeyType={"next"}
          ref={(ref) => {
            this.inputs['seven'] = ref;
          }}
        />
        <AvenirMedium style={styles.detailText}>La contraseña debe tener entre 6 y 16 caracteres, al menos un dígito, al menos una minúscula y al menos una mayúscula.</AvenirMedium>
        <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
          Confirmar Contraseña
        </AvenirMedium>
        <PasswordTextInput
          value={confirmPassword}
          placeholder={'escriba aquí'}
          styleContainer={{
            marginBottom: 20
          }}
          onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
          maxLength={16}
          onSubmitEditing={this.onValidate}
          returnKeyType={"done"}
          ref={(ref) => {
            this.inputs['eight'] = ref;
          }}
        />
        <PrimaryButton
          onTouch={this.onValidate}
          title='Registrarme'
        />
        <View style={{flexDirection: 'row', flex:1, marginLeft:15}}>
          <CheckBox
            tintColors={{ true: '#56a556' }}
            value={this.state.isSelected}
            onValueChange={() => this.setState({ isSelected: !this.state.isSelected })}
            style={{alignSelf: "center"}}
            boxType = {'square'}
          />
          <AvenirMedium style={[styles.detailText,{ marginBottom: 15, flex:1}]}>
              Aceptar las <AvenirMedium style={{ color: 'dodgerblue' }} onPress={() => {
                Linking.openURL('http://trans247.danthoppruebas.com/documentos/terminos.pdf')
                  .catch((err) => console.error('An error occurred by open reset password', err));
              }}>condiciones de uso</AvenirMedium> de TYLE y reconoces haber leído el <AvenirMedium style={{ color: 'dodgerblue' }} onPress={() => {
                Linking.openURL('http://trans247.danthoppruebas.com/documentos/aviso.pdf')
                  .catch((err) => console.error('An error occurred by open reset password', err));
              }}>aviso de privacidad.</AvenirMedium>
          </AvenirMedium>
        </View>
        <CustomAlert
          isVisible={isVisibleAlert}
          message={message}
          isLoading={isLoading}
          confirmText={'Aceptar'}
          onConfirmPressed={() => this.setState({ isVisibleAlert: false })}
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

export default connect(mapStateToProps, mapDispatchToProps)(SignUpScreen);

 const styles = StyleSheet.create({
   imageContainer: {
     alignItems: 'center'
   },
   image: {
     marginTop: 20,
     width: 120,
     height: 120,
     borderRadius: 60
   },
   detailText: { 
     marginHorizontal: 20, 
     marginTop: 10, 
     textAlign: 'justify', 
     color: 'gray', 
     fontSize: 12 
    }
 });
