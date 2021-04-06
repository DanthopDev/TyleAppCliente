import React, { Component } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Modal from "react-native-modal";
import SharedStyle from '../constants/SharedStyle';
import Header from './Header';
import { AvenirMedium } from './StyledText';
import Colors from '../constants/Colors';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { request, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import PrimaryButton from './PrimaryButton';
import CustomAlert from './CustomAlert';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

Geocoder.init("AIzaSyACjvIrosLQaCP4Y1PtnNoRRxjkWJ-TCxA", { language: "en" });


class SelectAddressMap extends Component {
    constructor(props) {
        super(props);
        const { isVisible }= props;
        this.state = {
            isLoading: true,
            isVisible: isVisible,
            address: '',
            latitude: 19.432608,
            longitude: -99.133209,
            region: {
                latitude: 19.432608,
                longitude: -99.133209,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            usePlaces: false,
            state_short_name: '',
            locality_long_name: '',
            isVisibleAlert: false,
            message: '',
        };
    }

    geocodingLatLong(latitude, longitude) {
        Geocoder.from({
            latitude: latitude,
            longitude: longitude
        })
            .then((response) => {
                console.log('================================ GEOCODING ==============================');
                this.searchLocationAndState(response.results[0].address_components);
                this.setState({
                    address: response.results[0].formatted_address,
                    isLoading: false
                });
            });
    }

    _getLocationAsync = async () => {
        let status = await this.requestPermisions();
        if (status == 'granted') {
            Geolocation.getCurrentPosition(
                (position) => {
                    this.geocodingLatLong(position.coords.latitude, position.coords.longitude);
                    this.setState({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        region: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            latitudeDelta: 0.017847000068837104,
                            longitudeDelta: 0.01316126435995102,
                        },
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
            Alert.alert('Permiso denegado', 'El acceso a la ubicacón fue denegado');
        }
    };

    componentDidMount() {
        const { getCurrentLocation, customLocation } = this.props;
        if(getCurrentLocation==false){
            this._getLocationAsync();
        }else {
                Geocoder.from(customLocation).then((response) => {
                    const latDelta = Number(response.results[0].geometry.viewport.northeast.lat) - Number(response.results[0].geometry.viewport.southwest.lat)
                    const lngDelta = Number(response.results[0].geometry.viewport.northeast.lng) - Number(response.results[0].geometry.viewport.southwest.lng)
                    this.searchLocationAndState(response.results[0].address_components);
                    let region = {
                        latitude: response.results[0].geometry.location.lat,
                        longitude: response.results[0].geometry.location.lng,
                        latitudeDelta: latDelta,
                        longitudeDelta: lngDelta
                    };
                    this.setState({
                        address: response.results[0].formatted_address,
                        isLoading: false,
                        region: region,
                        latitude: response.results[0].geometry.location.lat,
                        longitude: response.results[0].geometry.location.lng,
                    })
                    });
        }
    }
    
    async requestPermisions() {
        const locationStatus = await request(
            Platform.select({
                android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
            }), {
            title: 'Necesitamos acceder a tu ubicación',
            message: 'Para ofrecerte una mejor experiecia al seleccionar el punto de encuentro, es necesario nos compartas tu ubicación',
            buttonPositive: 'Entendido'
        });
        return locationStatus;
    }

    onRegionChange = (region) => {
        /* this.setState({ 
             latitude: region.latitude, 
             longitude: region.longitude,
             usePlaces: false, 
         }); */
    }
    onRegionChangeComplete = (region) => {
        /* if (this.state.usePlaces == false) {
            console.log('Gecoding')
            this.geocodingLatLong(region.latitude, region.longitude);
        }
        this.setState({
            region,
            latitude: region.latitude,
            longitude: region.longitude,
            usePlaces: false, 
        }); */
    }

    selectDestination = (data, details = null) => {
        const latDelta = Number(details.geometry.viewport.northeast.lat) - Number(details.geometry.viewport.southwest.lat)
        const lngDelta = Number(details.geometry.viewport.northeast.lng) - Number(details.geometry.viewport.southwest.lng)
        this.searchLocationAndState(details.address_components);
        let region = {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta
        };
        console.log('========== Address ====');
        console.log(this.refs.placeslocation.getAddressText());
        this.setState({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            region: region,
            usePlaces: true,
            address: this.refs.placeslocation.getAddressText(), // get the full address of the user's destination this.refs.placeslocation.getAddressText()
        });
    }

    onConfirmPress = () => {
        const { latitude, longitude, address, locality_long_name, state_short_name } = this.state;
        const { customLocation, title }=this.props;
        let result = {
            latitude, 
            longitude,
            address
        }
        let locationComponents = customLocation.split(',');
        /*console.log('==================== On ConfirmPress ====================');
        console.log(locationComponents);
        console.log([locality_long_name, state_short_name]);*/
        if (title == 'Punto de Encuentro') {
            if (locationComponents[0] == locality_long_name && locationComponents[1] == state_short_name) {
                this.props.onConfirmPress(result);
                this.props.dimiss();
            } else {
                this.setState({
                    isVisibleAlert: true,
                    message: 'La localidad selecciona no coincide con la localidad a la que arrivara el vehículo'
                });
            }
        }else {
            this.props.onConfirmPress(result);
            this.props.dimiss();
        }
        /*if(locationComponents[0] == locality_long_name && locationComponents[1] == state_short_name){
            this.props.onConfirmPress(result);
            this.props.dimiss();
        }else {
            if (title == 'Punto de Encuentro'){
                this.setState({
                    isVisibleAlert: true,
                    message: 'La localidad selecciona no coincide con la localidad a la que arrivara el vehículo'
                });
            }else {
                this.setState({
                    isVisibleAlert: true,
                    message: 'La localidad selecciona no coincide con la localidad a la que se dirige el vehículo'
                });
            }
        }*/
        /*const { navigation } = this.props;
        const { latitude, longitude, address } = this.state;
        const { service } = this.props.navigation.state.params;
        navigation.navigate('SelectDestination', {
            mettingPoint: {
                latitude,
                longitude,
                address
            },
            service: service
        });*/
    }

    searchLocationAndState= (addressComponents) => {
        let indexEstado = addressComponents.findIndex(element => element.types.indexOf('administrative_area_level_1') >= 0);
        let indexLocalidad = addressComponents.findIndex(element => element.types.indexOf('locality') >= 0);

        if (indexEstado >= 0 && indexLocalidad >= 0) {
            let state_short_name = addressComponents[indexEstado].short_name;
            let locality_long_name = addressComponents[indexLocalidad].long_name;
            this.setState({
                state_short_name,
                locality_long_name
            });
        }
    }

    render() {
        const { address, latitude, longitude, isLoading, region, isVisible, isVisibleAlert, message } = this.state;
        const { title } = this.props;
        return (
            <Modal 
            isVisible={isVisible}
            style={styles.modal}>
                <View style={SharedStyle.container}>
                    <Header
                        title={title}
                        leftIconName='close'
                        leftIconSize={24}
                        leftIconType='font-awesome'
                        onPressLeftIcon={() => this.props.dimiss()}
                    />
                    {
                        isLoading == true ?
                            <ActivityIndicator style={SharedStyle.activityIndicatorMap} size="large" color={Colors.green} /> :
                            <View style={styles.mapView}>
                                <MapView
                                    initialRegion={region}
                                    region={this.state.usePlaces == true ? region : null}
                                    onRegionChange={this.onRegionChange}
                                    onRegionChangeComplete={this.onRegionChangeComplete}
                                    style={SharedStyle.map}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude,
                                            longitude
                                        }}
                                        image={require('../../assets/images/pin.png')}
                                    />
                                </MapView>
                                <View style={SharedStyle.placesContainer}>
                                    <AvenirMedium style={SharedStyle.textAddressMap}>
                                        Dirección
                                </AvenirMedium>
                                    <GooglePlacesAutocomplete
                                        ref="placeslocation"
                                        placeholder='escriba aquí'
                                        textInputProps={{
                                            multiline: true,
                                            numberOfLines: 2,
                                            selectTextOnFocus: true,
                                        }}
                                        getDefaultValue={() => address}
                                        enablePoweredByContainer={false}
                                        minLength={5}
                                        returnKeyType={'search'}
                                        listViewDisplayed={address != '' ? 'false' : 'auto'}
                                        fetchDetails={true}
                                        onPress={this.selectDestination}
                                        query={{
                                            key: 'AIzaSyACjvIrosLQaCP4Y1PtnNoRRxjkWJ-TCxA',
                                            language: 'en',
                                            location: latitude + ',' + longitude,
                                            radius: '10000',
                                            types: ''
                                        }}
                                        styles={{
                                            textInputContainer: SharedStyle.placesTextInputContainer,
                                            textInput: SharedStyle.placesTextInput,
                                            listView: SharedStyle.placesListView,
                                        }}
                                    />
                                </View>
                                <PrimaryButton
                                    title='Confirmar'
                                    buttonContainer={SharedStyle.placesConfirmButtonContainer}
                                    onTouch={this.onConfirmPress}
                                />
                            </View>
                    }
                </View>
                <CustomAlert
                    isVisible={isVisibleAlert}
                    message={message}
                    confirmText={'Aceptar'}
                    onConfirmPressed={() => this.setState({ isVisibleAlert: false })}
                />
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
        margin: 0,
    },
    mapView: {
        flex: 1
    }
});

export default SelectAddressMap;