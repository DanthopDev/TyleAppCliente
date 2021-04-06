import React, { Component } from 'react';
import { View, KeyboardAvoidingView, TextInput, StyleSheet, ScrollView, Platform, Linking } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import Header from '../../components/Header';
import { AvenirMedium, AvenirHeavy, AvenirBook } from '../../components/StyledText';
import Colors from '../../constants/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import { sendHelpReportApi } from '../../utils/APIs';
import CustomAlert from '../../components/CustomAlert';

class HelpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      asunto: '',
      descripcion: '',
      showTitle: false,
      isVisibleAlert: false,
      isLoading: false,
      title: '',
      showSuccessAlert: false,
      message: '',
    };
    this.focusNextField = this.focusNextField.bind(this);
    this.inputs = {};
  }

  focusNextField(id) {
    this.inputs[id].focus();
  }

  dialCall = () => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = 'tel:${4448356438}';
    }
    else {
      phoneNumber = 'telprompt:${4448356438}';
    }
    Linking.openURL(phoneNumber);
  };

  onValidate= () => {
    const { asunto, descripcion } =this.state;
    if(asunto==''){
      this.setState({
        isVisibleAlert: true,
        showSuccessAlert: false,
        showTitle: false,
        message: 'Ingrese el asunto, asegurese de completar este campo',
      });
    }else if(descripcion==''){
      this.setState({
        isVisibleAlert: true,
        showSuccessAlert: false,
        showTitle: false,
        message: 'Ingrese una descripción, asegurese de completar este campo',
      });
    }else {
      this.setState({
        isVisibleAlert: true,
        isLoading: true,
        showTitle: false,
        message: 'Enviando el reporte...',
      });
      this.sendHelpReport();
    }
  }

  sendHelpReport() {
    const { asunto, descripcion } = this.state;
    sendHelpReportApi(asunto, descripcion).then(response => {
      console.log('============ HELP RESPONSE ====================');
      console.log(response);
      if (response.message =='Successfully create help report'){
        this.setState({
          isLoading: false,
          showSuccessAlert: true,
          isVisibleAlert: true,
          showTitle: true,
          title: 'Reporte enviado',
          message: 'Nos comunicaremos contigo lo antes posible para poder asistirte',
          asunto: '',
          descripcion: ''
        });
      }
    }).catch(error => {
      this.setState({
        isLoading: false,
        showSuccessAlert: false,
        isVisibleAlert: true,
        showTitle: false,
        message: 'Send Help Catch Errors, ' + JSON.stringify(error)
      })
    })
  }

  render() {
    const { asunto, descripcion, isVisibleAlert, isLoading, message, showSuccessAlert, title, showTitle }=this.state;
    const { navigation }=this.props;
    return (
        <View style={SharedStyle.container}>
            <Header
                title={'Ayuda'}
                showRightIcon
                rightIconName='phone'
                rightIconSize={22}
                rightIconType='font-awesome'
                onPressRightIcon={this.dialCall}
                leftIconName='menu'
                leftIconSize={26}
                leftIconType='entypo'
                onPressLeftIcon={() => navigation.openDrawer()}
            />
            <KeyboardAvoidingView style={SharedStyle.container} behavior="padding" enabled keyboardVerticalOffset={-500}>
              <ScrollView>
                  <AvenirMedium
                    style={styles.headerText}
                  >
                    Levanta un reporte para que te asistamos lo más pronto posible
                  </AvenirMedium>
                  <AvenirMedium style={[SharedStyle.text, { marginTop: 20 }]}>
                    Asunto
                  </AvenirMedium>
                  <TextInput
                    value={asunto}
                    placeholder={'escriba aquí'}
                    style={SharedStyle.input}
                    onChangeText={(asunto) => this.setState({ asunto })}
                    maxLength={150}
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
                    Descripción
                  </AvenirMedium>
                  <TextInput
                    value={descripcion}
                    placeholder={'escriba aquí'}
                    style={SharedStyle.input}
                    onChangeText={(descripcion) => this.setState({ descripcion })}
                    maxLength={250}
                    multiline={true}
                    numberOfLines={6}
                    returnKeyType={"done"}
                    ref={input => {
                      this.inputs['two'] = input;
                    }}
                  />
                  <AvenirBook style={SharedStyle.countContainer}>
                    { descripcion.length } / 250
                  </AvenirBook>
                  <PrimaryButton
                    title={'Enviar'}
                    buttonStyle={styles.sendButton}
                    onTouch={this.onValidate}
                  />
              </ScrollView>
            </KeyboardAvoidingView>
            <CustomAlert
              isVisible={isVisibleAlert}
              showTitle={showTitle}
              title={title}
              message={message}
              isLoading={isLoading}
              showSuccessIcon={showSuccessAlert}
              confirmText={'Aceptar'}
              onConfirmPressed={() => this.setState({ isVisibleAlert: false })}
            />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    headerText: {
        margin: 20,
        paddingHorizontal: 20,
        lineHeight: 18,
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
  sendButton: {
    marginTop: 50,
    marginBottom: 0
  }
});

export default HelpScreen;
