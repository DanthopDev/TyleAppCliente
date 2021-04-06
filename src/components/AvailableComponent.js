import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AvenirMedium, AvenirBook, AvenirHeavy } from './StyledText'; 
import Colors from '../constants/Colors';
import AntDesignIcon from '../components/AntDesignIcon';
import FeatherIcon from './FeatherIcon';

class AvailableComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { approximateArrive, approximateDeparture, vehicle, destination, price, onPress, isCompleteTravel }= this.props;
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View>
            <Text style={styles.interline}>
              <AvenirMedium>Llegada Aproximada: </AvenirMedium>
              <AvenirBook>{approximateArrive}</AvenirBook>
            </Text>
            <Text style={{ marginBottom: 5 }}>
              <AvenirMedium>Salida Aproximada: </AvenirMedium>
              <AvenirBook>{approximateDeparture}</AvenirBook>
            </Text>
          </View>
              {
              isCompleteTravel ? <FeatherIcon name={'refresh-ccw'}
                size={14} />: <AntDesignIcon
                name={'reload1'}
                size={14}
              />
              }
        </View>
        <View style={styles.row}>
            <Text style={styles.nameText}>
              <AvenirHeavy>T/U: </AvenirHeavy>
              <AvenirBook>{vehicle}</AvenirBook>
            </Text>
            <Text> 
              <AvenirHeavy>Precio: </AvenirHeavy>
              <AvenirBook>${price} MXN</AvenirBook>
            </Text>
        </View>
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
    paddingHorizontal: 10,
    paddingVertical: 22,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5
  },
  row: { 
    paddingBottom: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  nameText: { 
    flex: 1, 
    flexWrap: 'wrap',
    lineHeight: 18
  },
  destinationText: {
    color: Colors.green
  },
  interline: {

  }
});

export default AvailableComponent;
