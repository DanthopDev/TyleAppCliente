import React, { Component } from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import Header from '../../components/Header';
import { AvenirMedium } from '../../components/StyledText';
import PrimaryButton from '../../components/PrimaryButton';
import SelectAddressMap from '../../components/SelectAddressMap';
import CheckBox from '../../components/CheckBox';
import CustomAlert from '../../components/CustomAlert';
import firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import { setStatusServiceApi, askForTravelApi } from '../../utils/APIs';

class ExtraDetailsScreen extends Component {
  constructor(props) {
    super(props);
    const { service } = this.props.navigation.state.params;
    this.petitionRef = id => firebase.database().ref(`travels/${id}`);
    this.state = {
      descripcion: '',
      isVisibleModalMap: false,
      isVisibleAlert: false,
      message: '',
      meettingPoint: {
        address: ''
      },
      destination: {
        address: ''
      },
      checkedCreditCard: false,
      checkedStore: false,
      checkedDeposit: false,
      isLoading: false,
      showSuccessAlert: false,
    };
    //console.log('================= Servicio ===============',this.props.navigation.state.params);
  }
  componentDidMount() {
    const { service } = this.props.navigation.state.params;
    const { id } = this.props.session.user;
  }
  componentWillUnmount() {
    const { service } = this.props.navigation.state.params;
    this.petitionRef(service.id).off();
  }

  generatePetition = async () => {
    this.setState({
      isLoading: true,
      showSuccessAlert: false,
      isVisibleAlert: true,
      message: 'Obteniendo información...'
    });
    const { service } = this.props.navigation.state.params;
    const { meettingPoint, descripcion, destination } = this.state;
    let responseAskForTravel = await askForTravelApi(service.id, descripcion, meettingPoint, destination);
    if (responseAskForTravel.message == "Travel was requested"){
      this.setState({
        isLoading: false,
        showSuccessAlert: true,
        isVisibleAlert: true,
        message: 'Su solicitud fue enviada correctamente, en un periodo máximo de 10 minutos recibira respuesta',
      });
      
    } else if (responseAskForTravel.message == "Travel not avaible"){
      this.setState({
        isLoading: false,
        showSuccessAlert: false,
        isVisibleAlert: true,
        message: 'El viaje ya no esta disponible'
      });
      this.props.navigation.popToTop();
    } else {
      this.setState({
        isLoading: false,
        showSuccessAlert: false,
        isVisibleAlert: true,
        message: 'Ask For Travel Error, ' + responseAskForTravel.message
      });
    }
  }
  
  

  showMettingPoint= () => {
    this.setState({
      isVisibleModalMap: true,
      titleMap: 'Punto de Encuentro',
    });
  }
  showDestination = () => {
    this.setState({
      isVisibleModalMap: true,
      titleMap: 'Punto de Entrega',
    });
  }
  onConfirmPressMap= (result) => {
    const { titleMap }=this.state;
    if (titleMap == 'Punto de Encuentro'){
      this.setState({
        meettingPoint: result,
      });
    }else {
      this.setState({
        destination: result
      });
    }
  }

  onValidate=() => {
    const { meettingPoint, destination, checkedCreditCard, checkedDeposit, checkedStore } = this.state;
    const { navigation }= this.props;
    const { service } = this.props.navigation.state.params;
    if(meettingPoint.address==''){
      this.setState({
        isVisibleAlert: true,
        showSuccessAlert: false,
        message: 'Ingrese el punto de encuentro, este campo no puede estar vacío',
      });
    }else if(destination.address==''){
      this.setState({
        isVisibleAlert: true,
        showSuccessAlert: false,
        message: 'Ingrese el punto de entrega, este campo no puede estar vacío',
      });
    }else /*if(checkedCreditCard == false && checkedDeposit== false && checkedStore== false){
      this.setState({
        isVisibleAlert: true,
        showSuccessAlert: false,
        message: 'Seleccione un método de pago, es necesario para realizar el pago',
      });
    }else*/ {
        this.generatePetition();
    }
  }

  onPressCheckBoxCreditCard= () => {
    this.setState({
      checkedCreditCard: true,
      checkedStore: false,
      checkedDeposit: false
    });
  }
  onPressCheckBoxStore = () => {
    this.setState({
      checkedCreditCard: false,
      checkedStore: true,
      checkedDeposit: false
    });
  }
  onPressCheckBoxDeposit = () => {
    this.setState({
      checkedCreditCard: false,
      checkedStore: false,
      checkedDeposit: true
    });
  }

  getCustomLocation(){
    const { service } = this.props.navigation.state.params;
    const { titleMap }=this.state;
    if(titleMap == 'Punto de Encuentro'){
      if(service.modoTransportista==0){
        return service.destinoLocalidad + ',' + service.destinoEstado; 
      }else {
        return service.salidaLocalidad + ',' + service.salidaEstado; 
      }
    }else {
      if(service.modoTransportista == 0) {
        return service.salidaLocalidad + ',' + service.salidaEstado;
      } else {
        return service.destinoLocalidad + ',' + service.destinoEstado;
      }
    } 
  }

  render() {
    const { navigation }=this.props;
    const { showSuccessAlert, isLoading, descripcion, isVisibleModalMap, titleMap, isVisibleAlert, message, meettingPoint, destination, checkedCreditCard, checkedStore, checkedDeposit }=this.state;
    const { service } = this.props.navigation.state.params;
    return (
        <View style={SharedStyle.container}>
            <Header
                title={'Detalles Extra'}
                leftIconName='chevron-left'
                leftIconSize={24}
                leftIconType='font-awesome'
                onPressLeftIcon={() => navigation.goBack()}
            />
        <ScrollView>
        <View style={styles.row}>
            <AvenirMedium style={SharedStyle.labelText}>Punto de encuentro</AvenirMedium>
            <AvenirMedium
            onPress={this.showMettingPoint} 
            style={SharedStyle.infoText}>{meettingPoint.address == '' ? 'Seleccione aquí' : meettingPoint.address }</AvenirMedium>
        </View>
        <View style={styles.row}>
          <AvenirMedium style={SharedStyle.labelText}>Punto de entrega</AvenirMedium>
          <AvenirMedium 
          onPress={this.showDestination}
          style={SharedStyle.infoText}>{destination.address == '' ? 'Seleccione aquí' : destination.address}</AvenirMedium>
        </View>
        <AvenirMedium style={SharedStyle.text}>
          ¿Qué enviarás? ¿Necesita un trato especial?
        </AvenirMedium>
        <TextInput
          value={descripcion}
          placeholder={'escriba aquí'}
          style={[SharedStyle.input, { marginBottom: 20 }]}
          onChangeText={(descripcion) => this.setState({ descripcion })}
          maxLength={250}
          multiline={true}
          numberOfLines={4}
          returnKeyType={"done"}
        />
        {
          /*
           <AvenirMedium style={SharedStyle.text}>
            Selecciona un método de pago
        </AvenirMedium>
        <View style={styles.row}>
            <CheckBox
              isChecked={checkedCreditCard}
              onPress={this.onPressCheckBoxCreditCard}
              text={'Tarjeta bancaria'}

            />
            <CheckBox
              isChecked={checkedStore}
              onPress={this.onPressCheckBoxStore}
              text={'Tienda de auto servicio'}

            />
            <CheckBox
              isChecked={checkedDeposit}
              onPress={this.onPressCheckBoxDeposit}
              text={'Depósito en ventanilla'}

            />
        </View>
           */
        }
        <PrimaryButton 
          title={'Solicitar Servicio'}
          onTouch={this.onValidate}
        />
        </ScrollView>
        {
          isVisibleModalMap== true && <SelectAddressMap
            isVisible={isVisibleModalMap}
            title={titleMap}
            dimiss={() => this.setState({ isVisibleModalMap: false })}
            getCurrentLocation={titleMap == 'Punto de Encuentro' ? false : true}
            customLocation={this.getCustomLocation()}
            onConfirmPress={this.onConfirmPressMap}
          />
        }
        <CustomAlert
          isVisible={isVisibleAlert}
          message={message}
          isLoading={isLoading}
          showSuccessIcon={showSuccessAlert}
          confirmText={'Aceptar'}
          onConfirmPressed={() =>{
            this.setState({ isVisibleAlert: false });
            this.props.navigation.popToTop();
            this.props.navigation.navigate('PendingServices');
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = state => ({
  session: state.reducerSession,
  isConnected: state.reducerIsConnected,
});

const mapDispatchToProps = dispatch => ({
 
});

export default connect(mapStateToProps, mapDispatchToProps)(ExtraDetailsScreen);

const styles = StyleSheet.create({
  row: {
    marginHorizontal: 20,
    marginBottom: 20
  },
  checkBoxText: {
    fontSize: 18
  }
});


