import React, { Component } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, ScrollView, TouchableOpacity, Image } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import Header from '../../components/Header';
import { AvenirMedium, AvenirBook } from "../../components/StyledText";
import PasswordTextInput from '../../components/PasswordTextInput';
import TextInputMask from 'react-native-text-input-mask';
import PrimaryButton from '../../components/PrimaryButton';
import { request, PERMISSIONS } from 'react-native-permissions';
import ImagePicker from 'react-native-image-picker';
import CustomAlert from '../../components/CustomAlert';
import { connect } from 'react-redux';
import { actionSession } from '../../store/actions';
import Colors from '../../constants/Colors';
import { updateProfileApi } from '../../utils/APIs';
import EntypoIcon from '../../components/EntypoIcon';
import UrlBaseImage from '../../constants/UrlBaseImage';

class EditProfileScreen extends Component {
  constructor(props) {
    super(props);
    const { name, email } = props.session.user;
    const { empresa, telefono, telefonoOficina, telefonoOficinaExt, foto }= props.session.user.cliente;
    let uri=null;
    if(!(foto==null || foto=='null')){
        uri = UrlBaseImage + foto
    }
    this.state = {
        name: name,
        company: empresa,
        phone: telefono == null ? '' : telefono,
        companyPhone: telefonoOficina == null ? '' : telefonoOficina, 
        companyPhoneExt: telefonoOficinaExt == null ? '' :  telefonoOficinaExt,
        email: email,
        password: '',
        img: {
            uri: uri
        },
        confirmPassword: '',
        isVisibleAlert: false,
        message: '',
        showSuccessAlert: false,
        isLoading: false
    };
    this.focusNextField = this.focusNextField.bind(this);
    this.inputs = {};
  }

    focusNextField(id) {
        this.inputs[id].focus();
    }

    onValidate = () => {
        let regexPass = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{6,16}$/;
        const { name, company, phone, companyPhone, companyPhoneExt, password, confirmPassword } = this.state;
        console.log(phone.length);
        if (name == '') {
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'Ingrese su nombre, este campo no puede estar vacío',
            });
        } else if (company == '') {
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'Ingrese el nombre de la empresa a la que pertenece, este campo no puede estar vacío',
            });
        } else if (phone == '' && companyPhone == '') {
            this.setState({
                isVisibleAlert: true,
                message: 'Ingrese al menos un número de teléfono, es necesaria esta información',
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
        } else if (password == '' && confirmPassword=='') {
            if (this.props.isConnected) {
                this.setState({
                    isLoading: true,
                    isVisibleAlert: true,
                    message: 'Actualizando tu perfil...',
                });
                this.updateProfile();
            }else {
                this.setState({
                    isVisibleAlert: true,
                    isLoading: false,
                    showSuccessAlert: false,
                    message: 'Sin conexión a internet, intente de nuevo asegurandose de tener acceso a internet',
                });
            }
        } else if (!regexPass.test(password.trim())) {
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'Formato de contraseña incorrecto, la contraseña debe tener entre 6 y 16 caracteres, al menos un dígito, al menos una minúscula y al menos una mayúscula.',
            });
        } else if (password !== '' && confirmPassword == '') {
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'Confirme su contraseña, para cambiar su contraseña es necesario confirmar la nueva contraseña',
            });
        } else if (password.trim() != confirmPassword.trim()) {
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'Las contraseñas no coinciden, asegurese de que ingreso la misma contraseña',
            });
        } else {
            if(this.props.isConnected){
                this.setState({
                    isLoading: true,
                    isVisibleAlert: true,
                    message: 'Actualizando tu perfil...',
                });
                this.updateProfile();
            }else {
                this.setState({
                    isVisibleAlert: true,
                    message: 'Sin conexión a internet, intente de nuevo asegurandose de tener acceso a internet',
                });
            }
        }
    }

    updateProfile() {
        const { session } = this.props;
        const { name, company, phone, companyPhone, companyPhoneExt, password, img, confirmPassword }=this.state;

        updateProfileApi(name, company, phone, companyPhone, companyPhoneExt, password, img, confirmPassword).then((response)=> {
            if (response.message=="Successfully update user profile" && response.success== 200){
                let newSessionInfo = {
                    user: response.user,
                    access_token: session.access_token,
                    token_type: session.token_type
                }
                this.props.setSession(newSessionInfo);
                this.setState({
                    isLoading: false,
                    isVisibleAlert: true,
                    showSuccessAlert: true,
                    message: 'Cambio realizado exitosamente, su información fue actualizada de manera correcta',
                    password: '',
                    confirmPassword: '',
                });
            }else {
                this.setState({
                    isLoading: false,
                    showSuccessAlert: false,
                    message: 'Update Profile Api Errors, ' + JSON.stringify(response.errors)
                })
            }
        })
        .catch(err => {
            this.setState({
                isLoading: false,
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'Update Profile Catch Errors, ' + JSON.stringify(err)
            })
        })    
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

    pickImage = () => {
        this.requestPermisions().then(statuses => {
            const { cameraStatus, photoLibraryStatus } = statuses;
            if (cameraStatus == 'denied') {
                Alert.alert(
                    'Permiso de Acceso a Cámara Denegado',
                    'Para tomar la fotografía de perfil, es necesario este acceso',
                );
            } else if (photoLibraryStatus == 'denied') {
                Alert.alert(
                    'Permiso de Acceso a Galería Denegado',
                    'Para seleccionar la fotografía de perfil, es necesario este acceso',
                );
            } else {
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

  render() {
    const { navigation }=this.props;
    const { name, company, phone, companyPhone, companyPhoneExt, email, password, confirmPassword, isLoading, isVisibleAlert, message, img }=this.state;
    return (
      <View style={SharedStyle.container}>
            <Header
                title={'Editar Perfil'}
                leftIconName='menu'
                leftIconSize={26}
                leftIconType='entypo'
                onPressLeftIcon={() => navigation.openDrawer()}
            />
            <KeyboardAvoidingView style={SharedStyle.container} behavior="padding" enabled keyboardVerticalOffset={-500}>
                <ScrollView>
                    <View style={styles.imageContainer}>
                        <View>
                            <Image
                                style={styles.image}
                                resizeMode={'cover'}
                                source={img.uri == null || img.uri=='null' ? require('../../../assets/images/default_user.png') : img}
                            />
                            <TouchableOpacity
                            style={styles.editImage}
                                onPress={this.pickImage}>
                                <EntypoIcon
                                    name={'edit'}
                                    size={24}
                                    color={'white'}
                                />
                            </TouchableOpacity>
                        </View>                
                    </View>
                    <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>Correo Electrónico: {email}</AvenirMedium>
                    <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
                        Nombre Completo
                    </AvenirMedium>
                    <TextInput
                        value={name}
                        placeholder={'escriba aquí'}
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
                        placeholder={'escriba aquí'}
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
                            this.inputs['three'] = ref
                        }}
                        onChangeText={(formatted, extracted) => {
                            // formatted: +1 (123) 456-78-90
                            // extracted: 1234567890
                            this.setState({
                                phone: extracted
                            });
                        }}
                        mask={"([00]) [00] [00] [00] [00]"}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, width: '100%' }}>
                        <View style={{ flex: 1 }}>
                            <AvenirMedium style={[SharedStyle.text, { marginTop: 20, marginHorizontal: 0 }]}>
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
                        Nueva Contraseña
                    </AvenirMedium>
                    <PasswordTextInput
                        value={password}
                        placeholder={'escriba aquí'}
                        onChangeText={(password) => this.setState({ password })}
                        maxLength={200}
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                            this.focusNextField('seven');
                        }}
                        returnKeyType={"next"}
                        ref={(ref) => {
                            this.inputs['six'] = ref;
                        }}
                    />
                    <AvenirMedium style={styles.detailText}>La contraseña debe tener entre 6 y 16 caracteres, al menos un dígito, al menos una minúscula y al menos una mayúscula.</AvenirMedium>
                    <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
                        Confirmar Nueva Contraseña
                    </AvenirMedium>
                    <PasswordTextInput
                        value={confirmPassword}
                        placeholder={'escriba aquí'}
                        styleContainer={{
                            marginBottom: 20
                        }}
                        onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                        maxLength={200}
                        onSubmitEditing={this.onValidate}
                        returnKeyType={"done"}
                        ref={(ref) => {
                            this.inputs['seven'] = ref;
                        }}
                    />
                    <PrimaryButton
                        onTouch={this.onValidate}
                        title='Actualizar'
                    />
                </ScrollView>
            </KeyboardAvoidingView>
            <CustomAlert
                isVisible={isVisibleAlert}
                message={message}
                isLoading={isLoading}
                showSuccessIcon={this.state.showSuccessAlert}
                confirmText={'Aceptar'}
                onConfirmPressed={() => this.setState({ isVisibleAlert: !isVisibleAlert })}
            />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    imageContainer: {
        alignItems: 'center'
    },
    image: {
        width: 160,
        height: 160,
        borderRadius: 80
    },
    editImage: {
        width: 45,
        height: 45,
        backgroundColor: Colors.green,
        borderRadius: 22.5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: 20,
        borderWidth: 5,
        borderColor: Colors.background,
        bottom: 7
    },
    detailText: {
        marginHorizontal: 20,
        marginTop: 10,
        textAlign: 'justify',
        color: 'gray',
        fontSize: 12
    }
});

const mapStateToProps = state => ({
    session: state.reducerSession,
    isConnected: state.reducerIsConnected,
});

const mapDispatchToProps = dispatch => ({
    setSession: (value) => {
        dispatch(actionSession(value));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(EditProfileScreen);
