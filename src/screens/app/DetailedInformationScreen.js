import React, { Component } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import Header from '../../components/Header';
import { AvenirMedium } from '../../components/StyledText';
import PrimaryButton from '../../components/PrimaryButton';
import CustomAlert from '../../components/CustomAlert';
import moment from 'moment';


class DetailedInformationScreen extends Component {
  constructor(props) {
    super(props);
    const { service } = this.props.navigation.state.params;
    let message='';
    if (service.modoTransportista == 0)
      message = 'Este vehículo se dirige a ' + service.salidaLocalidad + ', ' + service.salidaEstado + ', solo se te permitirá ingresar direcciones de entrega de dicha localidad';
    else 
      message = 'Este vehículo se dirige a ' + service.destinoLocalidad + ', ' + service.destinoEstado + ', solo se te permitirá ingresar direcciones de entrega de dicha localidad'
    this.state = {
        isVisibleAlert: false,
        title: '¿Estás seguro de querer solicitar este servicio?',
        isLoading: false,
        message: message
    };
  }
  
  onConfirmPressed = () => {
    /*const { service } = this.props.navigation.state.params;
    this.petitionRef(service.transportistaId).set({
      viaje_id: service.id,
      isAccepted: false
    });
    this.setState({ 
      isLoading: true,
      title: 'Solicitando el servicio..',
      message: 'Conectando con con chofer del vehiculo o la empresa transportista...',
    });*/
      const { navigation }=this.props;
      this.setState({ isVisibleAlert: false });
      navigation.navigate('ExtraDetails', {
          service: navigation.state.params.service
      });
  }
  onCancelPressed= () => {
    this.setState({ isVisibleAlert: false });
  }

  render() {
      const { message, title, isVisibleAlert }= this.state;
      const { navigation } = this.props;
      const { service }=this.props.navigation.state.params;
      return (
          <View style={SharedStyle.container}>
            <Header
                title={'Información Detallada'}
                leftIconName='chevron-left'
                leftIconSize={24}
                leftIconType='font-awesome'
                onPressLeftIcon={() => navigation.goBack()}
            />
            <ScrollView>
              <View style={styles.row}>
                <View style={styles.rowItem}> 
                    <AvenirMedium style={SharedStyle.labelText}>Tipo de Unidad</AvenirMedium>
                    <AvenirMedium style={SharedStyle.infoText}>{service.vehiculo.tipo_unidad.descripcion}</AvenirMedium>   
                </View>
                <View style={styles.dividerView} />
                <View>
                    <AvenirMedium style={SharedStyle.labelText}>Llegada</AvenirMedium>
                    <AvenirMedium style={SharedStyle.infoText}>{service.modoTransportista == 0 ? moment(service.horaLlegadaEstimada).format('DD/MM/YYYY HH:mm') : '-------------------'}</AvenirMedium>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.rowItem}>
                    <AvenirMedium style={SharedStyle.labelText}>Tamaño de Caja</AvenirMedium>
                <AvenirMedium style={SharedStyle.infoText}>{service.vehiculo.tamano_de_caja ? service.vehiculo.tamano_de_caja.descripcion : 'N/A'}</AvenirMedium>
                </View>
                <View style={styles.dividerView} />
                <View>
                    <AvenirMedium style={SharedStyle.labelText}>Salida</AvenirMedium>
                    <AvenirMedium style={SharedStyle.infoText}>{service.modoTransportista == 0 ? moment(service.horaRegreso).format('DD/MM/YYYY HH:mm') : moment(service.horaSalida).format('DD/MM/YYYY HH:mm') }</AvenirMedium>
                </View>
              </View>
              <View style={styles.row}>
                <View>
                    <AvenirMedium style={SharedStyle.labelText}>No. de viaje</AvenirMedium>
                    <AvenirMedium style={SharedStyle.infoText}>{service.id}</AvenirMedium>
                </View>
                <View style={styles.dividerView} />
                <View style={styles.rowItem}>
                    <AvenirMedium style={SharedStyle.labelText}>Destino</AvenirMedium>
                    <AvenirMedium style={SharedStyle.infoText}>{service.modoTransportista == 0 ? service.lugarSalida : service.destinoTransportista }</AvenirMedium>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <AvenirMedium style={SharedStyle.labelText}>Placas</AvenirMedium>
                <AvenirMedium style={SharedStyle.infoText}>{service.vehiculo.placa ? service.vehiculo.placa : 'sin placas' }</AvenirMedium>
                </View>
                <View style={styles.dividerView} />
                <View style={styles.rowItem}>
                  <AvenirMedium style={SharedStyle.labelText}>Precio del Servicio</AvenirMedium>
                  <AvenirMedium style={SharedStyle.infoText}>${service.precio} MXN</AvenirMedium>
                </View>
              </View>
              <PrimaryButton
                title={'Continuar'}
                buttonStyle={styles.sendButton}
                onTouch={() => this.setState({ isVisibleAlert: true })}
              />
            </ScrollView>
            <CustomAlert
                isVisible={isVisibleAlert}
                message={message}
                isLoading={this.state.isLoading}
                showTitle
                title={title}
                confirmText={'Aceptar'}
                onConfirmPressed={this.onConfirmPressed}
                showCancelButton 
                onCancelPressed={this.onCancelPressed} 
                cancelText={'Cancelar'}
          />
          </View>
    );
  }
}

const styles = StyleSheet.create({
    sendButton: {
        marginHorizontal: 60
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginBottom: 20,
        flex: 1
    },
    rowItem: { 
      flex: 1 
    },
    dividerView: {
      width: 10
    }
});

export default DetailedInformationScreen;
