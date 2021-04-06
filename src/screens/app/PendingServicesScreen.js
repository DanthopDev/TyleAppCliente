import React, { Component } from 'react';
import { View, RefreshControl, FlatList, StyleSheet, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import Header from '../../components/Header';
import PendingServiceCard from '../../components/PendingServiceCard';
import CustomAlert from '../../components/CustomAlert';
import { getPendingServicesApi } from '../../utils/APIs';
import FontAwesomeIcon from '../../components/FontAwesomeIcon';
import { AvenirMedium } from '../../components/StyledText';
import Colors from '../../constants/Colors';
import moment from 'moment';
import SelectMethodOfPayment from '../../components/SelectMethodOfPayment';
import firebase from 'react-native-firebase';

class PendingServicesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: true,
        isRefreshing: false,
        isVisibleAlert: false,
        isVisibleSelectMethodOfPayment: false,
        pendingServices: [],
        message: 'El vehiculo aun se encuentra en Ruta de Entrega. Espera a que se termine su servicio actual para poder rastrearlo'
    };
  }

  componentDidMount(){
    this.props.navigation.addListener('didFocus', () => {
     this.getPendingServices(); 
    });
    this.createNotificationListeners();
  }
  componentWillUnmount(){
    this.notificationListener();
    this.notificationOpenedListener();
  }
  async createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification(notification => {
      const { type }=notification.data;
      if (type == 'acceptedTravelRequest' || type == 'rejectedTravelRequest') {
        this.getPendingServices();
      }
    });

    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { type } = notificationOpen.notification.data;
      if (type == 'acceptedTravelRequest' || type == 'rejectedTravelRequest') {
        this.getPendingServices();
      }
    });
  }
  getPendingServices() {
    getPendingServicesApi().then(response => {
      if (response.message == 'Successfully get pending services') {
        this.setState({
          isLoading: false,
          pendingServices: response.pendingServices,
          isRefreshing: false
        });
      } else {
        this.setState({
          isLoading: false,
          isVisibleAlert: true,
          message: 'Error Api GetPendingServices, ' + response.message,
          isRefreshing: false
        });
      }
    }).catch(err => console.log(err)) 
  }
  onPressPendingService(service) {
    if (service.estatusTransportista == 'en proceso de recoleccion' || service.estatusViaje == 'viaje en curso' || service.estatusTransportista == 'llegada confirmada' || service.estatusTransportista == 'carga confirmada'){
        this.props.navigation.navigate('Tracking',{ travel: service });
    } else if (service.estatusViaje == 'finalizado'){
    } else if(service.estatusViaje == 'reservado'){
      this.setState({
        isVisibleSelectMethodOfPayment: true,
        service: service,
      });
        //this.props.navigation.navigate('PayCreditCard', { service: service });
    } else{
      this.setState({
        isVisibleAlert: true
      });
    }
  }

  renderItem = ({ item }) => {
    if (item.viaje.modoTransportista == 0){
      return (<PendingServiceCard
        approximateArrive={moment(item.viaje.horaLlegadaEstimada).format('DD/MM/YYYY HH:mm')}
        approximateDeparture={moment(item.viaje.horaRegreso).format('DD/MM/YYYY H:mm')}
        vehicle={item.viaje.vehiculo.tipo_unidad.descripcion}
        status={item.viaje.estatusTransportista == 'en proceso de recoleccion' ? item.viaje.estatusTransportista : item.viaje.estatusViaje}
        company={item.viaje.transportista.empresa ? item.viaje.transportista.empresa.nombreDeLaEmpresa : '---'}
        numTravel={item.viaje.id}
        destination={item.direccionPuntoEntrega}
        licencsePlate={item.viaje.vehiculo.placa ? item.viaje.vehiculo.placa : 'sin placas'}
        price={(item.viaje.precio * 0.7).toFixed(2)}
        onPress={() => this.onPressPendingService(item.viaje)}
      />);
    }else {
      return (<PendingServiceCard
        approximateArrive={'-----'}
        approximateDeparture={moment(item.viaje.horaSalida).format('DD/MM/YYYY H:mm')}
        vehicle={item.viaje.vehiculo.tipo_unidad.descripcion}
        status={item.viaje.estatusTransportista == 'en proceso de recoleccion' ? item.viaje.estatusTransportista : item.viaje.estatusViaje}
        company={item.viaje.transportista.empresa ? item.viaje.transportista.empresa.nombreDeLaEmpresa : '---'}
        destination={item.direccionPuntoEntrega}
        licencsePlate={item.viaje.vehiculo.placa ? item.viaje.vehiculo.placa : 'sin placas' }
        numTravel={item.viaje.id}
        price={item.viaje.precio}
        onPress={() => this.onPressPendingService(item.viaje)}
      />);
    }}

  renderEmptyComponent = () => {
      return (
        <View style={SharedStyle.emptyComponent}>
          <FontAwesomeIcon name={'warning'} size={60} color={'lightgray'} />
              <AvenirMedium style={SharedStyle.textEmptyComponent}>
                Sin servicios pendientes
              </AvenirMedium>
        </View>
      );
  }

  async onRefresh() {
    this.setState({ isRefreshing: true });
    this.getPendingServices();
  }

  onConfirmPressed = (selected) => {
    const { service }=this.state;
    if (selected == 'credit_card'){
      this.props.navigation.navigate('PayCreditCard', { service: service });
    }
    if(selected == 'store'){

    }
    if (selected = 'deposit'){

    }
    this.setState({
      isVisibleSelectMethodOfPayment: false
    });
  }

  render() {
    const { navigation }=this.props;
    const { isVisibleAlert, message, isLoading, pendingServices, isVisibleSelectMethodOfPayment }=this.state;  
    return (
      <View style={SharedStyle.container}>
            <Header
                title={'Mis Servicios Pendientes'}
                leftIconName='menu'
                leftIconSize={26}
                leftIconType='entypo'
                onPressLeftIcon={() => navigation.openDrawer()}
            />
            {
              isLoading == true ? <ActivityIndicator size="large" color={Colors.green} /> : <FlatList
                data={pendingServices}
                renderItem={this.renderItem}
                refreshing={true}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.onRefresh.bind(this)}
                  />
                }
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={this.renderEmptyComponent()}
              />
            }
            <SelectMethodOfPayment
              isVisible={isVisibleSelectMethodOfPayment}
              confirmText={'Continuar'}
              cancelText={'Cancelar'}
              onConfirmPressed={this.onConfirmPressed}
              onCancelPressed={() => {
               this.setState({
                 isVisibleSelectMethodOfPayment: false
               });
             }}
            />
            <CustomAlert
                isVisible={isVisibleAlert}
                message={message}
                confirmText={'Aceptar'}
                onConfirmPressed={() => this.setState({ isVisibleAlert: !isVisibleAlert })}
            />
      </View>
    );
  }
}

const styles = StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    }
});

export default PendingServicesScreen;
