import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AvenirMedium, AvenirBook, AvenirHeavy } from './StyledText';
import Colors from '../constants/Colors';

class PendingServiceCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { approximateArrive, approximateDeparture, vehicle, destination, price, status, company, onPress, numTravel, licencsePlate } = this.props;
        return (
            <TouchableOpacity onPress={onPress} style={styles.container}>
                <Text style={styles.interline}>
                    <AvenirMedium>Llegada Aproximada: </AvenirMedium>
                    <AvenirBook>{approximateArrive}</AvenirBook>
                </Text>
                <Text style={{ marginBottom: 5 }}>
                    <AvenirMedium>Salida Aproximada: </AvenirMedium>
                    <AvenirBook>{approximateDeparture}</AvenirBook>
                </Text>
                <View style={styles.row}>
                    <AvenirHeavy style={styles.nameText}>
                        {vehicle}
                    </AvenirHeavy>
                    <Text>
                        <AvenirHeavy>Precio: </AvenirHeavy>
                        <AvenirBook>${price} MXN</AvenirBook>
                    </Text>
                </View>
                <Text>
                    <AvenirMedium>Status: </AvenirMedium>
                    <AvenirMedium style={{ color: Colors.pink}}>{status}</AvenirMedium>
                </Text>
                <Text>
                    <AvenirMedium>Empresa: </AvenirMedium>
                    <AvenirMedium >{company}</AvenirMedium>
                </Text>
                 <Text>
                    <AvenirMedium>No. viaje: </AvenirMedium>
                    <AvenirMedium >{numTravel}</AvenirMedium>
                 </Text>
                <Text style={{ marginBottom: 5 }}>
                    <AvenirMedium>Placas: </AvenirMedium>
                    <AvenirMedium >{licencsePlate}</AvenirMedium>
                </Text>
                <Text>
                    <AvenirMedium>Destino: </AvenirMedium>
                    <AvenirMedium style={styles.destinationText}>{destination}</AvenirMedium>
                </Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 3,
        //paddingHorizontal: 10,
        //paddingVertical: 20,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    row: {
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    nameText: {
        flex: 1,
        flexWrap: 'wrap'
    },
    destinationText: {
        color: Colors.green
    },
    interline: {
        lineHeight: 18
    }
});

export default PendingServiceCard;
