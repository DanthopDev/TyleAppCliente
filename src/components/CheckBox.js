import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesomeIcon from '../components/FontAwesomeIcon';
import { AvenirMedium, AvenirHeavy } from './StyledText';
import Colors from '../constants/Colors';

const CheckBox = ({
    isChecked, 
    onPress,
    text,
    iconSize,
    textStyle,
    showAvenirHeavy
}) => (
    <TouchableOpacity onPress={onPress} style={styles.container}>
            {   isChecked == true ? <FontAwesomeIcon
                    name='check-square-o'
                    color={Colors.green}
                    size={iconSize ? iconSize : 20}
                /> : <FontAwesomeIcon
                    name='square-o'
                    color={'gray'}
                    size={iconSize ? iconSize : 20}
                />
         }
        { showAvenirHeavy ? <AvenirHeavy style={textStyle}> {text} </AvenirHeavy> : <AvenirMedium style={[{ marginLeft: 10 }, textStyle]}>
            {text}
        </AvenirMedium> }
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    }
});

export default CheckBox;
