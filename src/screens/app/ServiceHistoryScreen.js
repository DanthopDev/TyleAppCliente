import React, { Component } from 'react';
import { View, FlatList, StyleSheet, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import Header from '../../components/Header';
import Modal from 'react-native-modal';
import { AvenirHeavy, AvenirBook, AvenirMedium } from '../../components/StyledText';
import Colors from '../../constants/Colors';
import FontAwesomeIcon from '../../components/FontAwesomeIcon';
import PrimaryButton from '../../components/PrimaryButton';
import CustomAlert from '../../components/CustomAlert';
import ServiceHistoryItem from '../../components/ServiceHistoryItem';
import { AirbnbRating } from 'react-native-ratings';
import { getTravelHistoryApi, rateTravelApi } from '../../utils/APIs';
import moment from 'moment';

class ServiceHistoryScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            history: [],
            isVisibleRatingModal: false,
            ratingColor: Colors.green,
            currentServiceIndex: null,
            comments: '',
            ratingValue: 0,
            isVisibleAlert: false,
            message: '',
            ratigError: false,
            isLoading: true,
        };
    }
    componentDidMount(){
        this.getTravelHistory();
    }
    getTravelHistory(){
        getTravelHistoryApi().then(response => {
            if (response.message == 'Successfully') {
                this.setState({
                    history: response.history,
                    isLoading: false,
                    isRefreshing: false,
                });
            } else {
                this.setState({
                    isVisibleAlert: true,
                    isLoading: false,
                    isRefreshing: false,
                    message: 'Get Travel History Error, ' + response.message,
                })
            }
        });
    }

    onRefresh() {
        this.setState({ isRefreshing: true });
        this.getTravelHistory();
    }
    renderItem = ({ item, index }) => {
        if (item.modoTransportista == 0){
            return(
                <ServiceHistoryItem
                    arrive={moment(item.horaLlegadaEstimada).format('DD/MM/YYYY HH:mm')}
                    departure={moment(item.horaRegreso).format('DD/MM/YYYY H:mm')}
                    vehicle={item.vehiculo.tipo_unidad.descripcion}
                    status={item.estatusViaje}
                    company={item.transportista.empresa ? item.transportista.empresa.nombreDeLaEmpresa : '---'}
                    destination={item.solicitudes[0].direccionPuntoEntrega}
                    origin={item.solicitudes[0].direccionPuntoEncuentro}
                    price={(item.precio*0.7).toFixed(2)}
                    rating={item.calificacion}
                    onRatingPress={() => {
                        this.setState({
                            isVisibleRatingModal: true,
                            currentServiceIndex: index,
                            ratingValue: 0,
                            comments: ''
                        });
                    }}
                />
            );
        }else {
            return(
                <ServiceHistoryItem
                    arrive={'-----'}
                    departure={moment(item.horaSalida).format('DD/MM/YYYY H:mm')}
                    vehicle={item.vehiculo.tipo_unidad.descripcion}
                    status={item.estatusViaje}
                    company={item.transportista.empresa ? item.transportista.empresa.nombreDeLaEmpresa : '---'}
                    destination={item.solicitudes[0].direccionPuntoEntrega}
                    origin={item.solicitudes[0].direccionPuntoEncuentro}
                    price={item.precio}
                    rating={item.calificacion}
                    onRatingPress={() => {
                        this.setState({
                            isVisibleRatingModal: true,
                            currentServiceIndex: index,
                            ratingValue: 0,
                            comments: ''
                        });
                    }}
                /> 
            );
        }
    }

    renderEmptyComponent = () => {
        return (
            <View style={SharedStyle.emptyComponent}>
                <FontAwesomeIcon name={'warning'} size={60} color={'lightgray'} />
                <AvenirMedium style={SharedStyle.textEmptyComponent}>
                    Sin historial de servicios
              </AvenirMedium>
            </View>
        );
    }

    sendRating= () => {
            const { currentServiceIndex, history, ratingValue, comments }=this.state;
            if(ratingValue>0){
                rateTravelApi(history[currentServiceIndex].id, ratingValue, comments).then(response => {
                    console.log('==================== RESPONSE RATE TRAVEL ============');
                    console.log(response);
                    if (response.message =='Successfully'){
                        let auxHistory = history;
                        auxHistory[currentServiceIndex].calificacion = response.calificacion
                        this.setState({
                            history: auxHistory,
                            isVisibleRatingModal: false,
                            ratingValue: 0,
                            comments: ''
                        });
                    }else {
                        this.setState({
                            isVisibleAlert: true,
                            message: 'Rate Travel Api Error, ' + response.message,
                        });
                    }
                });
            }else {
                this.setState({
                    ratingError: true
                });
            }
    }

    onFinishRating = (rating) => {
            if (rating == 1 || rating == 2) {
                this.setState({
                    ratingColor: 'red',
                    ratingValue: rating,
                    ratingError: false
                });
            }
            if (rating == 3) {
                this.setState({
                    ratingColor: 'gold',
                    ratingValue: rating,
                    ratingError: false
                });
            }
            if (rating == 4 || rating == 5) {
                this.setState({
                    ratingColor: Colors.green,
                    ratingValue: rating,
                    ratingError: false
                });
            }
    }

    render() {
        const { navigation } = this.props;
        const { history, isLoading, isVisibleRatingModal, ratingColor, comments, ratingError, isVisibleAlert, message }=this.state;
        return (
            <View style={SharedStyle.container}>
                <Header
                    title={'Historial de Servicios'}
                    leftIconName='menu'
                    leftIconSize={26}
                    leftIconType='entypo'
                    onPressLeftIcon={() => navigation.openDrawer()}
                />
                { isLoading == true ? <ActivityIndicator size="large" color={Colors.green} /> : <FlatList
                    data={history}
                    renderItem={this.renderItem}
                    keyExtractor={item => item.id.toString()}
                    refreshing={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }
                    ListEmptyComponent={this.renderEmptyComponent()}
                /> }
                <CustomAlert
                    isVisible={isVisibleAlert}
                    message={message}
                    confirmText={'Aceptar'}
                    onConfirmPressed={() => this.setState({ isVisibleAlert: !isVisibleAlert })}
                />
                <Modal
                    isVisible={isVisibleRatingModal}
                    style={styles.modal}
                    swipeDirection={['down']}
                    avoidKeyboard={true}
                    onSwipeComplete={() => this.setState({ isVisibleRatingModal: false })}
                    onBackdropPress={() => this.setState({ isVisibleRatingModal: false })}>
                    <View style={styles.raitingContainer}>
                      <AvenirHeavy style={styles.ratingTitle}>¿Qué te parecio el servicio?</AvenirHeavy>
                        <AirbnbRating
                            count={5}
                            reviewSize={20}
                            reviews={['Terrible', 'Malo', 'Regular', 'Bueno', 'Excelente']}
                            selectedColor={ratingColor}
                            reviewColor={ratingColor}
                            defaultRating={0}
                            size={25}
                            onFinishRating={this.onFinishRating}
                        />
                        <AvenirMedium style={styles.labelComments}>Comentarios</AvenirMedium>
                        <TextInput
                            value={comments}
                            placeholder={'Agrega tus comentarios'}
                            multiline={true}
                            numberOfLines={5}
                            style={styles.commentsInput}
                            onChangeText={(comments) => this.setState({ comments })} 
                        />
                        <PrimaryButton
                            title='Calificar'
                            buttonStyle={styles.ratingButton}
                            onTouch={this.sendRating}
                        />
                        { ratingError && <AvenirBook style={styles.ratingErrorText}>Selecciona una calificación para el servicio</AvenirBook> }
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    raitingContainer: {
        backgroundColor: 'white',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        padding: 20
    },
    labelComments: { 
        marginBottom: 10, 
        fontSize: 14 
    },
    commentsInput: {
        backgroundColor: 'aliceblue',
        borderRadius: 5,
        fontFamily: 'AvenirLTStd-Medium',
        fontWeight: 'normal'
    },
    ratingButton: {
        padding: 10,
        marginBottom: 0
    },
    ratingTitle: {
        fontSize: 20,
        textAlign: 'center'
    },
    ratingErrorText: { 
        position: 'absolute', 
        top: 60, 
        marginHorizontal: 20, 
        color: 'red' 
    }
});

export default ServiceHistoryScreen;
