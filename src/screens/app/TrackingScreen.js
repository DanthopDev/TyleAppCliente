import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Platform, Dimensions } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import MapView, { AnimatedRegion, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import FontAwesomeIcon from '../../components/FontAwesomeIcon';
import Colors from '../../constants/Colors';
import { AvenirHeavy, AvenirMedium } from '../../components/StyledText';
import PrimaryButton from '../../components/PrimaryButton';
import EntypoIcon from '../../components/EntypoIcon';
import ImagePicker from 'react-native-image-picker';
import { request, PERMISSIONS } from 'react-native-permissions';
import MaterialIcon from '../../components/MaterialIcon';
import CustomAlert from '../../components/CustomAlert';
import firebase from 'react-native-firebase';
import { confirmVehicleArrivalApi, sendEvidenceOfLoadApi }  from '../../utils/APIs';

const screen = Dimensions.get('screen');

const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.00522;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class TrackingScreen extends Component {
  constructor(props) {
    super(props);
    this.travelRef = id => firebase.database().ref(`travels/${id}`);
    this._currentRegion = new AnimatedRegion({
          latitude: 19.432608,
          longitude: -99.133209,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
      }); 
    this.state = {
        isVisibleAlert: false,
        showSuccessAlert: false,
        message: '',
        isLoading: false,
        latitude: 19.432608,
        longitude: -99.133209,
        coordinate: new AnimatedRegion({
            latitude: 19.432608,
            longitude: -99.133209,
            latitudeDelta: 0,
            longitudeDelta: 0
        }),
        confirmTitle: '',
        confirmBody: '',
        dimissConfirmComponet: true,
        dimissReadyComponent: true,
        images: [],
    };
  }

    componentDidMount() {
        const { travel }=this.props.navigation.state.params;
        this.travelRef(travel.id).on('value', (snapshot2) => {
            let petition = snapshot2.val();
            if(petition!=null){
                const { latitude, longitude } = petition;
                this.setState({
                    petition: petition
                });
                /*console.log('========================================= Peticion =====================================');
                console.log(petition);*/
                const newCoordinate = {
                    latitude,
                    longitude
                };
                this._currentRegion.timing({
                    latitude: newCoordinate.latitude,
                    longitude: newCoordinate.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LATITUDE_DELTA
                    , duration: 2000
                }).start();
                if (Platform.OS === 'android') {
                    if (this.marker) {
                        this.marker._component.animateMarkerToCoordinate(newCoordinate, 500);
                    }
                } else {
                    coordinate.timing(newCoordinate).start();
                }
                this.setState({
                    latitude: petition.latitude,
                    longitude: petition.longitude,
                });
                if (petition.status == 'en proceso de recoleccion') {
                    let confirmTitle = petition.meettingPoint.address.split(',')[0];
                    let confirmBody = petition.meettingPoint.address.substring(confirmTitle.length + 2, petition.meettingPoint.address.length);
                    let distance = this.getKilometros(latitude, longitude, petition.meettingPoint.latitude, petition.meettingPoint.longitude);
                    this.setState({
                        dimissConfirmComponet: false,
                        confirmTitle,
                        confirmBody,
                        distance
                    });
                }
                if (petition.status == 'llegada confirmada') {
                    this.setState({
                        dimissConfirmComponet: true,
                        dimissReadyComponent: false,
                    });
                }
                if (petition.status == 'viaje en curso') {
                    this.setState({
                        dimissConfirmComponet: true,
                        dimissReadyComponent: true,
                    });
                }
            }else {
                this.props.navigation.goBack();
            }
        });
        
    }
    componentWillUnmount() {
        const { travel } = this.props.navigation.state.params;
        this.travelRef(travel.id).off();
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

  onPressCameraIcon= () => {
      if(this.state.images.length>=6){
          this.setState({
              isVisibleAlert: true,
              message: 'Solo se permite ingresar como máximo 6 fotografías'
          })
      }else {
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
                  let options = {
                      mediaType: 'photo',
                      quality: 0.5,
                      allowsEditing: true,
                  }
                  ImagePicker.launchCamera(options, (response) => {
                      if (response.didCancel) {
                          //console.log('User cancelled image picker');
                      } else if (response.error) {
                          //console.log('ImagePicker Error: ', response.error);
                      } else if (response.customButton) {
                          //console.log('User tapped custom button: ', response.customButton);
                      } else {
                            const source = { uri: response.uri };
                            let images = this.state.images;
                            images.push(source);
                            this.setState({
                                images: images
                            });
                      }
                  });
              }
          });
      }
  }
    renderImage = ({ item, index }) => {
    return(
        <View>
            <Image
                source={item}
                style={styles.imageStyles}
                resizeMode={'contain'}
            />
            <TouchableOpacity style={styles.removeImageIcon} onPress={() => {
                let auxImages= this.state.images;
                auxImages.splice(index, 1);
                this.setState({
                    images: auxImages
                });
            }}>
                <MaterialIcon
                    name={'delete'}
                    color={'black'}
                    size={24}
                />
            </TouchableOpacity>
        </View>
       );
    }
    sendImages= async () => {
        const { travel } = this.props.navigation.state.params;
        const { images }= this.state;
        console.log('Tamaño: ', images.length);
        this.setState({
            isVisibleAlert: true,
            isLoading: true,
            message: 'Enviando las imagenes de evidencia, esto puede tardar un poco no salgas de la app...',
        });
        sendEvidenceOfLoadApi(travel.id, images).then(response => {
            if (response.message =='Successfully'){
                this.travelRef(travel.id).update({
                    status: 'carga confirmada'
                });
                this.setState({
                    isLoading: false,
                    message: 'Se han enviado las imagenes de manera correcta',
                    showSuccessAlert: true,
                    dimissReadyComponent: true
                });
            }else {
                this.setState({
                    isVisibleAlert: true,
                    showSuccessAlert: false,
                    isLoading: true,
                    message: 'Error al enviar las imagenes, ' + response.message,
                });
            }
        });
        /*
        setTimeout(async ()=> {
            this.setState({
                isLoading: false,
                message: 'Se han enviado las imagenes de manera correcta',
                showSuccessAlert: true,
                dimissReadyComponent: true
            });
            this.travelRef(travel.id).update({
                status: 'carga confirmada'
            });
            let resSetStatusTransportista = await setStatusTravelTransportistaApi(travel.id, 'carga confirmada');
        }, 2000);*/
    }

    getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    });

    getKilometros(lat1, lon1, lat2, lon2) {
        var rad = (x) => x * Math.PI / 180
        var R = 6378.137; //Radio de la tierra en km
        var dLat = rad(lat2 - lat1);
        var dLong = rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d.toFixed(2)//Retorna dos decimales
    }

    onPressConfirmArrive = () => {
        const { travel } = this.props.navigation.state.params;
        this.setState({
            isVisibleAlert: true,
            isLoading: true,
            showSuccessAlert: false,
            message: 'Confirmando llegada ...',
        });
        confirmVehicleArrivalApi(travel.id).then(response => {
            if (response.message =='Successfully'){
                this.setState({
                    dimissConfirmComponet: true,
                    isVisibleAlert: false,
                    isLoading: false,
                    showSuccessAlert: false,
                    message: '',
                });
                this.travelRef(travel.id).update({
                    status: 'llegada confirmada'
                });
            } else {
                this.setState({
                    isVisibleAlert: true,
                    showSuccessAlert: false,
                    isLoading: false,
                    message: 'Confirm Vehicule Arrival Api Error, ' + response.message,
                });
            }
        });
    }
  render() {
    const { latitude, longitude, region, dimissConfirmComponet, dimissReadyComponent, images, isVisibleAlert, showSuccessAlert, isLoading, message }=this.state;
    return (
      <View style={SharedStyle.container}>
            <MapView.Animated
                ref={ref => {
                    this.map = ref;
                }}
                initialRegion={this.getMapRegion()}
                region={this._currentRegion}
                style={SharedStyle.map}
            >
                <Marker.Animated
                    coordinate={this.state.coordinate}
                    ref={marker => {
                        this.marker = marker;
                    }}
                    image={require('../../../assets/images/pin.png')}
                />
            </MapView.Animated>
            <TouchableOpacity style={styles.iconButtonStyle} onPress={()=> this.props.navigation.goBack()}>
                <FontAwesomeIcon
                    name={'close'}
                    color={Colors.green}
                    size={24}
                />
            </TouchableOpacity>
            {
                dimissConfirmComponet == false ? <View style={styles.confirmArriveContainer}>
                    <View style={styles.headerContainer}>
                        <AvenirHeavy style={styles.headerText}>Confirmar Llegada</AvenirHeavy>
                    </View>
                    <View>
                        <AvenirHeavy style={styles.boldText}>{ this.state.confirmTitle }</AvenirHeavy>
                        <AvenirMedium style={styles.text}>{ this.state.confirmBody} { this.state.distance } km</AvenirMedium>
                        <PrimaryButton
                            title='Confirmar Llegada'
                            buttonStyle={styles.button}
                            onTouch={this.onPressConfirmArrive}
                        />
                    </View>
                </View> : dimissReadyComponent==false ? <View style={styles.confirmArriveContainer}>
                        <View style={styles.headerContainer}>
                            <AvenirHeavy style={styles.headerText}>Confirmar Carga Lista</AvenirHeavy>
                        </View>
                        <View>
                            <View style={styles.rowDestination}>
                                <AvenirMedium style={styles.grayText}>Destino</AvenirMedium>
                                <AvenirMedium style={{flex: 1}}>{/*this.state.petition.destination.address*/}</AvenirMedium>
                            </View>
                                <TouchableOpacity style={styles.cameraIcon} onPress={this.onPressCameraIcon}>
                                    <EntypoIcon
                                        name={'camera'}
                                        color={'lightgray'}
                                        size={26}
                                    />
                                </TouchableOpacity>
                                <FlatList
                                    data={images}
                                    renderItem={this.renderImage}
                                    ListHeaderComponent={<View style={{width: 20}}/>}
                                    horizontal={true}
                                    refreshing={true}
                                    keyExtractor={(item, index) => index.toString()}
                                    />
                            <PrimaryButton
                                title='Continuar'
                                buttonStyle={styles.button}
                                onTouch={this.sendImages}
                            />
                        </View>
                    </View> : null
            }
            <CustomAlert
                isVisible={isVisibleAlert}
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
    iconButtonStyle: {
        position: 'absolute',
        top: 10,
        right: 10
    },
    headerContainer: {
        padding: 10,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5
    },
    headerText: {
        fontSize: 18,
    },
    confirmArriveContainer: {
        backgroundColor: Colors.background,
        position: 'absolute',
        bottom: 0,
        width: '100%'
    },
    boldText: { 
        fontSize: 16, 
        marginHorizontal: 20, 
        marginTop: 20 
    },
    text: { 
        marginHorizontal: 20 
    },
    grayText: {
        color: 'gray',
        marginRight: 20
    },
    button: {
        padding: 10
    },
    rowDestination: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginHorizontal: 20, 
        marginTop: 20 
    },
    imageStyles: {
        height: 100, 
        width: 150, 
        marginVertical: 10, 
        marginRight: 10, 
        backgroundColor: 'lightgray' 
    },
    cameraIcon: { 
        marginHorizontal: 20, 
        marginTop: 20 
    },
    removeImageIcon: {
        position: 'absolute',
        bottom: 10,
        right: 10
    }
});

export default TrackingScreen;
