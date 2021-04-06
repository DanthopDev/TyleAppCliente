import React, { Component } from 'react';
import { View, Vibration, TouchableOpacity, FlatList, StyleSheet, ScrollView, Dimensions, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import Header from '../../components/Header';
import AvailableComponent from '../../components/AvailableComponent';
import Modal from 'react-native-modal';
import { AvenirHeavy, AvenirMedium } from '../../components/StyledText';
import Colors from '../../constants/Colors';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import FontAwesome from '../../components/FontAwesomeIcon';
import PrimaryButton from '../../components/PrimaryButton';
import moment from 'moment';
import Layout from '../../constants/Layout';
import CheckBox from '../../components/CheckBox';
import { getAvailableVehiculesApi } from '../../utils/APIs';
import FontAwesomeIcon from '../../components/FontAwesomeIcon';
import { connect } from 'react-redux';
import { request, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import CustomAlert from '../../components/CustomAlert';
import firebase from 'react-native-firebase';
import AntDesignIcon from '../../components/AntDesignIcon';
import FeatherIcon from '../../components/FeatherIcon';


Geocoder.init("AIzaSyACjvIrosLQaCP4Y1PtnNoRRxjkWJ-TCxA", { language: "en" });

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serviciosCompleto: [],
      servicios: [], 
      isVisible: false,
      isDatePickerVisible: false,
      isArriveDate: true,
      arriveDateISO: new Date(),
      arriveDate: moment().format('DD/MM/YYYY'),
      departureDateISO: new Date(),
      departureDate: moment().format('DD/MM/YYYY'),
      minimumDate: new Date(),
      dateValue: new Date(),
      tiposDeVehiculo: [],
      tiposDeCaja: [],
      isRotate: false,
      isLoading: true,
      isRefreshing: false,
      isVisibleAlert: false,
      message: '',
      state_short_name: null,
      locality_long_name: null,
      isCheckedTracto: false,
      isCheckedArriveDate: false,
      isCheckedDepartureDate: false
    }; 
  }

  async componentDidMount() {
    this.props.navigation.addListener('didFocus', () => {
      const { state_short_name, locality_long_name } =this.state;
      if (state_short_name != '' && locality_long_name != '' && state_short_name != null && locality_long_name != null){
        this.getAvailableVehicules(state_short_name, locality_long_name);
      }
    });
    if (this.props.isConnected) {
      this._getLocationAsync();
    }else {
      this.setState({
        isVisibleAlert: true,
        message: 'Sin conexión a internet, intente de nuevo asegurandose de tener acceso a internet',
      });
    }
    this.createNotificationListeners(); //add this line
  }

  //Remove listeners allocated in createNotificationListeners()
  
  async createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification(notification => {
      //Vibration.vibrate(1000);
      const {
        notifications: {
          Android: {
            Priority: { Max }
          }
        }
      } = firebase;
      notification.android.setChannelId('loc_noti_cliente');
      notification.android.setPriority(Max);
      notification.setData(notification.data);
      firebase.notifications().displayNotification(notification);
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      console.log('======= Open notification: ', notificationOpen.notification);
      const { title, body } = notificationOpen.notification;
      //this.showAlert('open notification', body);
      firebase.notifications().removeDeliveredNotification(notificationOpen.notification._notificationId);
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    console.log('======= CLOSE NOTIFICATION: ', notificationOpen);
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      //this.showAlert('close notification', body);
      firebase.notifications().removeDeliveredNotification(notificationOpen.notification._notificationId);
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });
  }

  getAvailableVehicules(state, locality) {
    if(this.props.isConnected) {
      getAvailableVehiculesApi(state, locality).then(result => {
        if (result.success) {
          console.log('============== TIPOS DE  CONTENER (TAMAÑO DE CAJA) =============');
          this.setState({
            serviciosCompleto: result.viajes,
            tiposDeVehiculo: result.tiposDeVehiculo,
            tiposDeCaja: result.tiposDeCaja,
            servicios: result.viajes,
            isLoading: false,
            isRefreshing: false
          });
        } else {
          console.log(result);
          this.setState({
            isRefreshing: false,
            isVisibleAlert: true,
            isLoading: false,
            message: 'Error Available Vehicules, ' + result.message 
          });
        }
      });
    }else {
      this.setState({
        isVisibleAlert: true,
        message: 'Sin conexión a internet, intente de nuevo asegurandose de tener acceso a internet',
      });
    }
  }

  async requestPermisions() {
    const locationStatus = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
      }));
    return locationStatus;
  }
  _getLocationAsync = async () => {
    let status = await this.requestPermisions();
    if (status == 'granted') {
      Geolocation.getCurrentPosition((position) => {
          Geocoder.from({
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
          }).then((response) => {
              let indexEstado= response.results[0].address_components.findIndex(element => element.types.indexOf('administrative_area_level_1') >= 0);
              let indexLocalidad = response.results[0].address_components.findIndex(element => element.types.indexOf('locality') >= 0);
              if(indexEstado>=0 && indexLocalidad>=0){
                let state_short_name = response.results[0].address_components[indexEstado].short_name;
                let locality_long_name = response.results[0].address_components[indexLocalidad].long_name;
                this.setState({
                  state_short_name,
                  locality_long_name
                });
                this.getAvailableVehicules(state_short_name, locality_long_name);
              }else {
                this.setState({
                  isLoading: false,
                  isVisibleAlert: true,
                  message: 'No fue posible obtener tu localidad y estado para mostrarte los vehículos diponibles en tu zona',
                });
              }
            });
        },
        (error) => {
          // See error code charts below.
          console.log(error);
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      this.setState({
        isVisibleAlert: true,
        message: 'Permiso de acceso a tu ubicación denegado, para optener los vehiculos diponibles en tu zona es necesario nos proporciones el acceso a tu ubicación.'
      });
    }
  };

  async onRefresh() {
    const { state_short_name, locality_long_name }=this.state;
      let status = await this.requestPermisions();
      if (status == 'granted') {
        this.setState({ isRefreshing: true });
        this.getAvailableVehicules(state_short_name, locality_long_name);
      }else {
        this.setState({
          isVisibleAlert: true,
          message: 'Permiso de acceso a tu ubicación denegado, para optener los vehiculos diponibles en tu zona es necesario nos proporciones el acceso a tu ubicación.'
        });
      }
  }

  hideDatePicker= ()=> {
    this.setState({
      isDatePickerVisible: false
    })
  }

  handleConfirm = date => {
    let formatDate= moment(date).format('DD/MM/YYYY');
    const { departureDateISO, isArriveDate }=this.state;
    if(isArriveDate){
      if (date > departureDateISO) {
        this.setState({
          arriveDateISO: date,
          arriveDate: formatDate,
          departureDate: formatDate,
          isDatePickerVisible: false,
          minimumDate: date
        });
      }else {
        this.setState({
          arriveDateISO: date,
          arriveDate: formatDate,
          isDatePickerVisible: false,
          minimumDate: date
        })
      }
    }else {
      this.setState({
        departureDateISO: date,
        departureDate: formatDate,
        isDatePickerVisible: false
      })
    }
  };
//+ ' , ' + item.vehiculo.tipo_de_caja.descripcion + ', ' + item.vehiculo.tipo_de_contenedor.descripcion
  renderItem = ({ item }) => {
      if(item.modoTransportista==0){
        return (<AvailableComponent
          approximateArrive={moment(item.horaLlegadaEstimada).format('DD/MM/YYYY HH:mm')}
          approximateDeparture={moment(item.horaRegreso).format('DD/MM/YYYY H:mm')}
          vehicle={item.vehiculo.tipo_unidad.descripcion}
          destination={item.lugarSalida}
          price={(item.precio*0.70).toFixed(2)}
          onPress={() => this.props.navigation.navigate('DetailedInformation', { service: item })}
          isCompleteTravel={false}
        />);
      }else {
        return (<AvailableComponent
          approximateArrive={'-----'}
          approximateDeparture={moment(item.horaSalida).format('DD/MM/YYYY H:mm')}
          vehicle={item.vehiculo.tipo_unidad.descripcion}
          destination={item.destinoTransportista}
          price={item.precio}
          onPress={() => this.props.navigation.navigate('DetailedInformation', { service: item })}
          isCompleteTravel={true}
        />);
      }
  }

  onLayout(e) {
    const screen = Dimensions.get('screen');
    if(screen.height> screen.width){
      this.setState({
        isRotate: false
      });
    }else {
      this.setState({
        isRotate: true
      });
    }
  }

  onFilter= () => {
    const { tiposDeVehiculo, serviciosCompleto, tiposDeCaja, arriveDate, departureDate, isCheckedArriveDate, isCheckedDepartureDate }=this.state;
    let checkedTiposDeVehiculos = tiposDeVehiculo.filter(item => item.isChecked == true);
    let checkedTiposDeCaja = tiposDeCaja.filter(item => item.isChecked == true);
    let filterServicios = serviciosCompleto;
    // horaLlegadaEstimada  -> fecha de llegada  horaRegreso -> fecha de salida
    if(isCheckedArriveDate==true){
      filterServicios = filterServicios.filter(ser => (moment(ser.horaLlegadaEstimada).format('DD/MM/YYYY') == arriveDate || ser.modoTransportista==1))
    }
    if(isCheckedDepartureDate==true){
      filterServicios = filterServicios.filter(servicio => {
        if(servicio.modoTransportista==1){
          return (moment(servicio.horaSalida).format('DD/MM/YYYY') == departureDate);
        }else {
          return (moment(servicio.horaRegreso).format('DD/MM/YYYY') == departureDate);
        }
      });
    }
    //filterServicios= serviciosCompleto.filter(servicio => moment(servicio.horaLlegadaEstimada).format('DD/MM/YYYY') ==  arriveDate && moment(servicio.horaRegreso).format('DD/MM/YYYY') ==  departureDate);
    
    if(checkedTiposDeVehiculos.length==0){
        if(checkedTiposDeCaja.length != 0){
          /// Filtra solo aplicando tipos de caja
          filterServicios = filterServicios.filter(element => checkedTiposDeCaja.findIndex(caja => caja.descripcion == element.vehiculo.tamano_de_caja.descripcion) >= 0);
        }
    }else {
      // Filtra por tipo de vehículo
      filterServicios = filterServicios.filter(element => checkedTiposDeVehiculos.findIndex(tipo => tipo.descripcion == element.vehiculo.tipo_unidad.descripcion) >= 0);
      if(checkedTiposDeCaja.length !=0){
        /// Filtra aplicando los dos filtros
        filterServicios = filterServicios.filter(element => checkedTiposDeCaja.findIndex(caja => caja.descripcion == element.vehiculo.tamano_de_caja.descripcion) >= 0);
      console.log('Entra a filtrar');
      console.log(filterServicios);
      }
    }
    this.setState({
      servicios: filterServicios,
      isVisible: false,
    });
  }

  onPressCheckBoxTipoVehiculo = (index) => {
    const { tiposDeVehiculo, tiposDeCaja }=this.state;
    let auxTiposVehiculos = tiposDeVehiculo;
    auxTiposVehiculos[index].isChecked = !tiposDeVehiculo[index].isChecked;
    if (auxTiposVehiculos[index].descripcion =='Tracto'){
      if (auxTiposVehiculos[index].isChecked == false) {
        let auxTiposDeCaja = [];
        tiposDeCaja.forEach(element => {
          element.isChecked = false;
          auxTiposDeCaja.push(element);
        });
        this.setState({
          tiposDeVehiculo: auxTiposVehiculos,
          isCheckedTracto: auxTiposVehiculos[index].isChecked,
          tiposDeCaja: auxTiposDeCaja
        });
      }else {
        this.setState({
          tiposDeVehiculo: auxTiposVehiculos,
          isCheckedTracto: auxTiposVehiculos[index].isChecked,
        });
      }
    }else {
        this.setState({
          tiposDeVehiculo: auxTiposVehiculos
        });
    }
  }

  onPressCheckBoxTipoCaja = (index) => {
    const { tiposDeCaja }= this.state;
    let auxTiposDeCaja = tiposDeCaja;
    auxTiposDeCaja[index].isChecked = !tiposDeCaja[index].isChecked;
    this.setState({
      tiposDeCaja: auxTiposDeCaja
    });
  }

  renderEmptyComponent = () => {
    const { serviciosCompleto, isLoading }=this.state;
    if(isLoading==true && serviciosCompleto.length==0)
      return null;
    else
      return(
        <View style={SharedStyle.emptyComponent}>
                <FontAwesomeIcon name={'warning'} size={60} color={'lightgray'} />
                {
                  serviciosCompleto.length == 0 ? 
                  <AvenirMedium style={SharedStyle.textEmptyComponent}>
                    Sin vehÍculos disponibles en tu zona
                  </AvenirMedium> : 
                  <AvenirMedium style={SharedStyle.textEmptyComponent}>
                    Sin resultados
                  </AvenirMedium>
                }
                {
                  serviciosCompleto.length == 0 ? null : 
                    <PrimaryButton
                      title={'Mostrar Todo'}
                      onTouch={() => {
                        this.setState({
                          servicios: serviciosCompleto
                        })
                      }}
                    />
                }
          </View>
        );
  }

  render() {
    const { navigation }=this.props;
    const { isRotate, servicios, isDatePickerVisible, arriveDate, departureDate, isArriveDate, 
      minimumDate, tiposDeCaja, tiposDeVehiculo, arriveDateISO, departureDateISO, 
      isVisible, isVisibleAlert, message, isLoading, state_short_name, locality_long_name }=this.state;
    return (
      <View style={SharedStyle.container} onLayout={this.onLayout.bind(this)}>
        <Header
          title={'Vehículos diponibles en tu zona ' + locality_long_name + ' ,' + state_short_name}
          showRightIcon
          rightIconName='list'
          rightIconSize={26}
          rightIconType='entypo'
          onPressRightIcon={() => this.setState({ isVisible: !isVisible})}
          leftIconName='menu'
          leftIconSize={26}
          leftIconType='entypo'
          onPressLeftIcon={() => navigation.openDrawer()}
        />
        {
          isLoading == true && servicios.length==0 ? <ActivityIndicator size="large" color={Colors.green} /> : <FlatList
              data={servicios}
              renderItem={this.renderItem}
            ListHeaderComponent={<View style={{ marginHorizontal: 10}}>
              {/*<View style={{ flexDirection: 'row' }}>
                  <FeatherIcon
                    name={'refresh-ccw'}
                    size={14} />
                    <AvenirMedium> Unidad disponible</AvenirMedium>
              </View>*/}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AntDesignIcon
                  name={'reload1'}
                  size={14}
                />
                  <AvenirMedium> Unidad para regreso</AvenirMedium>
                </View>
              </View>}
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
        <Modal
          isVisible={isVisible}
          style={styles.modalFilter}
          onBackButtonPress={() => this.setState({ isVisible: false })}
          >
          <View style={styles.filterContainer}>
            <View style={[styles.filterHeader, styles.border]}>
                <AvenirHeavy style={{ fontSize: 22 }}>
                  Filtros
                </AvenirHeavy>
                <TouchableOpacity onPress={() => this.setState({ isVisible: !isVisible })}>
                  <AvenirHeavy style={styles.cancelButton}>Cancelar</AvenirHeavy>
                </TouchableOpacity>
            </View>
            <ScrollView style={[isRotate == true ? { height: (Layout.window.width - 120) } : { height: (Layout.window.height - 200) }]} >
              <View style={[styles.filterTypeContainer, styles.border]}>
                <AvenirHeavy style={styles.filterTitle}>
                  Tipo de Unidad
              </AvenirHeavy>
                <View style={{flex: 1}}>
                { tiposDeVehiculo.map((tipoVehiculo, index) => {
                  return(
                    <CheckBox
                      key={index.toString()}
                      isChecked={tipoVehiculo.isChecked}
                      onPress={() => this.onPressCheckBoxTipoVehiculo(index)}
                      text={tipoVehiculo.descripcion}
                    />
                  );
                })}
                </View>
              </View>
              {
                this.state.isCheckedTracto == true && <View style={[styles.filterTypeContainer, styles.border]}>
                  <AvenirHeavy style={styles.filterTitle}>
                    Tamaño de Caja
                  </AvenirHeavy>
                  <View style={{ flex: 1 }}>
                    {tiposDeCaja.map((contenedor, index) => {
                      return (
                        <CheckBox
                          key={index.toString()}
                          isChecked={contenedor.isChecked}
                          onPress={() => this.onPressCheckBoxTipoCaja(index)}
                          text={contenedor.descripcion}
                        />
                      );
                    })}
                  </View>
                </View>
              }
              <View style={styles.filterHeader}>
                <View>
                  <CheckBox 
                    isChecked={this.state.isCheckedArriveDate}
                    text={'Fecha Llegada'}
                    showAvenirHeavy
                    textStyle={styles.titlesDate}
                    onPress={() => this.setState({ isCheckedArriveDate: !this.state.isCheckedArriveDate })}
                  />
                  <TouchableOpacity onPress={() => {
                    this.setState({
                      isDatePickerVisible: true,
                      isArriveDate: true,
                      minimumDate: new Date(),
                    })
                  }}>
                    <AvenirMedium>
                      {arriveDate} <FontAwesome
                        name={'caret-down'}
                        size={18}
                      />
                    </AvenirMedium>
                  </TouchableOpacity>
                </View>
                <View>
                  <CheckBox
                    isChecked={this.state.isCheckedDepartureDate}
                    text={'Fecha Salida'}
                    showAvenirHeavy
                    textStyle={styles.titlesDate}
                    onPress={() => this.setState({ isCheckedDepartureDate: !this.state.isCheckedDepartureDate })}
                  />
                  <TouchableOpacity onPress={() => this.setState({
                    isDatePickerVisible: true,
                    isArriveDate: false
                  })}>
                    <AvenirMedium>
                      {departureDate}  <FontAwesome
                        name={'caret-down'}
                        size={18}
                      />
                    </AvenirMedium>
                  </TouchableOpacity>
                </View>
              </View>
              <PrimaryButton
                title='Filtrar'
                buttonContainer={{
                  alignItems: 'center',
                  paddingBottom: 22,
                }}
                buttonStyle={styles.filterButton}
                onTouch={this.onFilter}
              />
            </ScrollView>
           </View>
        </Modal>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={isArriveDate== true ? arriveDateISO : departureDateISO}
          onConfirm={this.handleConfirm}
          onCancel={this.hideDatePicker}
          minimumDate={minimumDate}
        />
        <CustomAlert
          isVisible={isVisibleAlert}
          message={message}
          isLoading={isLoading}
          confirmText={'Aceptar'}
          onConfirmPressed={() => this.setState({ isVisibleAlert: false })}
        />
      </View>
    );
  }
}

const mapStateToProps = state => ({
  isConnected: state.reducerIsConnected,
});

const mapDispatchToProps = dispatch => ({

});

const styles = StyleSheet.create({
  modalFilter: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  cancelButton: { 
    color: Colors.green, 
    marginVertical: 5 
  },
  filterContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  border: {
    borderBottomColor: 'gray', 
    borderBottomWidth: 0.5
  },
  filterTypeContainer: {
    padding: 20,
    flexDirection: 'row'
  },
  filterTitle: { 
    width: 130, 
    color: 'gray', 
    fontSize: 15 
  },
  titlesDate: {
    color: 'gray',
    fontSize: 15
  },
  filterButton: {
    marginTop: 0,
    marginBottom: 0,
    padding: 10,
    paddingHorizontal: 20,
    height: 35,
    width: 160
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
