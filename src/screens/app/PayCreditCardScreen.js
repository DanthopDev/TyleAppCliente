import React, { Component } from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, ScrollView, BackHandler } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import { AvenirHeavy, AvenirMedium } from '../../components/StyledText';
import FontAwesomeIcon from '../../components/FontAwesomeIcon';
import Colors from '../../constants/Colors';
import TextInputMask from 'react-native-text-input-mask';
import PrimaryButton from '../../components/PrimaryButton';
import CustomAlert from '../../components/CustomAlert';
import Conekta from 'react-native-conekta';
import { setStatusServiceApi, payWithCreditCardApi } from '../../utils/APIs';
import firebase from 'react-native-firebase';


class PayCreditCardScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
        card: '4242424242424242',
        name: 'Fulanito Pérez',
        valid: '11/21',
        cvv: '111',
        isVisibleAlert: false,
        message: '',
        showSuccessAlert: false,
        isLoading: false
    };
    this.focusNextField = this.focusNextField.bind(this);
    this.inputs = {};
  }

    /*componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
    }

    componentWillUnmount() {
        this.backHandler.remove();
    }*/

    focusNextField(id) {
        this.inputs[id].focus();
    }
    
    onValidate = () => {
        const { card, name, valid, cvv }=this.state;
        console.log('Tarjeta: ', card);
        console.log('Nombre: ', name);
        console.log('Valid: ', valid, ' longuitud: ', valid.length);
        console.log('CVV: ', cvv);
        if(card=='' || card.length!=16){
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'Ingrese correctamente su tarjeta, asegurese de completar este campo ó ingresa todos los digitos de su tarjeta',
            });
        }else if(name==''){
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'Ingrese su nombre, este campo no puede estar vacío',
            });
        }else if(valid=='' || valid.length!=5){
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'La fecha de expiración es incorrecto, asegurese de completar este campo',
            });
        }else if(valid.split('/')[0]>12){
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'El mes de la fecha de expiración es mayor a 12',
            });
        }else if(cvv=='' || cvv.length!=3){
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'El código de seguridad es incorrecto, asegurese de completar este campo',
            });
        }else {
            this.setState({
                isLoading: true,
                isVisibleAlert: true,
                showSuccessAlert: false,
                message: 'El pago esta siendo procesado',
            });
            this._createCardToken();
        }
    }
    sendInfoToPay(cardTokenId) {
        const { service } = this.props.navigation.state.params;
        let monto = null;
        if(service.modoTransportista==0){
            monto = (service.precio * 0.70).toFixed(2);
        }else {
            monto = service.precio;
        }
        payWithCreditCardApi(cardTokenId, service.id,monto).then(response => {
            if (response.message =='Successfully') {
                let petitionRef = id => firebase.database().ref(`travels/${id}`);
                petitionRef(service.id).update({
                    status: 'pagado'
                });
                petitionRef(service.id).off();
                this.setState({
                    isLoading: false,
                    isVisibleAlert: true,
                    showSuccessAlert: true,
                    message: 'El pago ha sido autorizado',
                });
            } else {
                this.setState({
                    isLoading: false,
                    isVisibleAlert: true,
                    showSuccessAlert: false,
                    message: 'Algo salio mal, ' + response.message,
                });
            }
        }).catch(err => {
            console.log(err);
        });
    }
    setStatusService() {
        const { service } = this.props.navigation.state.params;
        setStatusServiceApi(service.id, 'pagado').then(response => {
            console.log(response);
            if (response.message =='Successfully change status service'){
                let petitionRef = id => firebase.database().ref(`travels/${id}`);
                petitionRef(service.id).update({
                    status: 'pagado'
                });
                petitionRef(service.id).off();
                    this.setState({
                        isLoading: false,
                        isVisibleAlert: true,
                        showSuccessAlert: true,
                        message: 'El pago ha sido autorizado',
                    });
            }else {
                this.setState({
                    isLoading: false,
                    isVisibleAlert: true,
                    showSuccessAlert: false,
                    message: 'Algo salio mal, ' + response.message,
                });
            }
        }).catch(err => {
            console.log(err);
        })
    }

    _createCardToken() {
        const { card, name, valid, cvv } = this.state;
        let validArray= valid.split('/');
        let expMonth= validArray[0];
        let expYear= validArray[1];
        let conektaApi = new Conekta();

        conektaApi.setPublicKey('key_KJysdbf6PotS2ut2');

        conektaApi.createToken({
            cardNumber: card,
            name: name,
            cvc: cvv,
            expMonth: expMonth,
            expYear: expYear,
        }, (data) => {
            console.log('CONEKTA DATA:', data); // data.id to get the Token ID
            if (data.object=='token'){
                this.sendInfoToPay(data.id);
            }else {
                this.setState({
                    isVisibleAlert: true,
                    showSuccessAlert: false,
                    isLoading: false,
                    message: data.message_to_purchaser + ', code: ' + data.code + '  type: ' + data.type + ' message: ' + data.message,
                });
            }
        }, () => {
            console.log('Error!');
        });
    }
  render() {
    const { navigation } = this.props;
    const { card, name, valid, cvv, isVisibleAlert, showSuccessAlert, isLoading, message }=this.state;
    return (
      <View style={SharedStyle.container}>
            <TouchableOpacity style={styles.iconStyle} onPress={() => navigation.goBack()}>
                <FontAwesomeIcon
                    name={'close'}
                    size={26}
                    color={Colors.green}
                />
            </TouchableOpacity>
            <KeyboardAvoidingView style={SharedStyle.container} behavior="padding" enabled keyboardVerticalOffset={-500}>
                <ScrollView>
                    <View style={styles.imageContainer}>
                        <Image
                            style={styles.image}
                            source={require('../../../assets/images/logo_negro.png')}
                        />
                        <AvenirHeavy style={SharedStyle.title}>
                            Confirmar Pago de Servicio
                    </AvenirHeavy>
                    </View>
                    <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
                        Tarjeta
                    </AvenirMedium>
                    <TextInputMask
                        value={card}
                        placeholder={'**** **** **** 0000'}
                        style={SharedStyle.input}
                        keyboardType={'number-pad'}
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                            this.focusNextField('name');
                        }}
                        returnKeyType={"next"}
                        refInput={ref => {
                            this.input = ref
                            this.inputs['card'] = ref
                        }}
                        onChangeText={(formatted, extracted) => {
                            // formatted: 0000 0000 0000 0000
                            // extracted: 1234567890
                            this.setState({
                                card: extracted
                            });
                        }}
                        mask={"[0000] [0000] [0000] [0000]"}
                    />
                    <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
                        Nombre registrado en la tarjeta
                    </AvenirMedium>
                    <TextInput
                        value={name}
                        placeholder={'escriba aquí'}
                        style={SharedStyle.input}
                        onChangeText={(name) => this.setState({ name: name })}
                        maxLength={200}
                        autoCapitalize={'characters'}
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                            this.focusNextField('valid');
                        }}
                        returnKeyType={"next"}
                        ref={input => {
                            this.inputs['name'] = input;
                        }}
                    />
                    <View style={styles.row}>
                        <View style={styles.itemRow}>
                            <AvenirMedium style={SharedStyle.text}>
                                MM / AA
                            </AvenirMedium>
                            <TextInputMask
                                value={valid}
                                placeholder={'00/00'}
                                style={SharedStyle.input}
                                keyboardType={'number-pad'}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    this.focusNextField('cvv');
                                }}
                                returnKeyType={"next"}
                                refInput={ref => {
                                    this.input = ref
                                    this.inputs['valid'] = ref
                                }}
                                onChangeText={(formatted, extracted) => {
                                    // formatted: 00/00
                                    // extracted: 0000
                                    this.setState({
                                        valid: extracted
                                    });
                                }}
                                mask={"[00]{/}[00]"}
                            />
                        </View>
                        <View style={styles.itemRow}>
                            <AvenirMedium style={SharedStyle.text}>
                                CVV
                            </AvenirMedium>
                            <TextInputMask
                                value={cvv}
                                placeholder={'000'}
                                style={SharedStyle.input}
                                keyboardType={'number-pad'}
                                blurOnSubmit={false}
                                onSubmitEditing={this.onValidate}
                                returnKeyType={"done"}
                                refInput={ref => {
                                    this.input = ref
                                    this.inputs['cvv'] = ref
                                }}
                                onChangeText={(formatted, extracted) => {
                                    this.setState({
                                        cvv: extracted
                                    });
                                }}
                                mask={"[000]"}
                            />
                        </View>
                    </View>
                    <PrimaryButton
                        title={'Pagar'}
                        onTouch={this.onValidate}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
            <CustomAlert
                isVisible={isVisibleAlert}
                message={message}
                isLoading={isLoading}
                showSuccessIcon={showSuccessAlert}
                confirmText={'Aceptar'}
                onConfirmPressed={() => {
                    this.props.navigation.goBack();
                    this.setState({ isVisibleAlert: false });
                    }}
            />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    iconStyle: {
        margin: 10,
        padding: 3
    },
    imageContainer: {
        flex: 4,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20
    },
    image: {
        width: 240,
        height: 160,
        marginBottom: 30,
        resizeMode: 'contain',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 20
    },
    itemRow: { 
        width: '50%',
    }
});

export default PayCreditCardScreen;
