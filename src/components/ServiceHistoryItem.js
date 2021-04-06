import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AvenirMedium, AvenirBook, AvenirHeavy } from './StyledText';
import Colors from '../constants/Colors';
import { Rating, AirbnbRating } from 'react-native-ratings';
import Icon from 'react-native-vector-icons/MaterialIcons';

class ServiceHistoryItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { arrive, departure, vehicle, destination, price, status, company, origin, rating, onRatingPress } = this.props;
        return (
            <View style={styles.container}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10, 
                marginTop: 2
            }}>
                    <AvenirMedium>Calificación: </AvenirMedium>
                    { rating != null ? <AirbnbRating
                        count={5}
                        showRating={false}
                        reviewSize={10}
                        selectedColor={Colors.green}
                        reviewColor={Colors.green}
                        isDisabled={true}
                        defaultRating={rating.calificacion}
                        size={16}
                    /> : <AvenirBook>Sin calificar</AvenirBook>
                    }
            </View>
                <Text>
                    <AvenirMedium>Llegada: </AvenirMedium>
                    <AvenirBook>{arrive}</AvenirBook>
                </Text>
                <Text style={styles.interline2}>
                    <AvenirMedium>Salida: </AvenirMedium>
                    <AvenirBook>{departure}</AvenirBook>
                </Text>
                <View style={styles.row}>
                    <Text>
                        <AvenirHeavy>T/U: </AvenirHeavy>
                        <AvenirBook>{vehicle}</AvenirBook>
                    </Text>
                    <Text>
                        <AvenirHeavy>Precio: </AvenirHeavy>
                        <AvenirBook>${price} MXN</AvenirBook>
                    </Text>
                </View>
                <Text>
                    <AvenirMedium>Status: </AvenirMedium>
                    <AvenirBook>{status}</AvenirBook>
                </Text>
                <Text style={styles.interline1}>
                    <AvenirMedium>Empresa: </AvenirMedium>
                    <AvenirBook>{company}</AvenirBook>
                </Text>
                    <AvenirMedium>Destino: </AvenirMedium>
                    <AvenirMedium style={[styles.destinationText, styles.interline2]}>{destination}</AvenirMedium>
                    <AvenirMedium>Origen: </AvenirMedium>
                    <AvenirMedium style={styles.destinationText}>{origin}</AvenirMedium>
                    {
                        rating == null && <View style={styles.ratingButtonContainer}>
                            <Icon.Button
                                name="stars"
                                backgroundColor="gold"
                                onPress={onRatingPress}>
                                <AvenirMedium style={{ color: 'white' }}>Calificar</AvenirMedium>
                            </Icon.Button>
                        </View>
                    }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
        
    },
    row: {
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    nameText: {
        flex: 1,
        flexWrap: 'wrap'
    },
    destinationText: {
        color: Colors.green
    },
    interline1: { 
        marginBottom: 20 
    },
    interline2: { 
        marginBottom: 5 
    },
    ratingButtonContainer: {
        alignItems: 'flex-end',
        marginTop: 10
    }
});

export default ServiceHistoryItem;