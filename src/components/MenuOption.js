import React from 'react';
import { View, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcon from './MaterialIcon';
import { AvenirMedium } from './StyledText';
import Colors from '../constants/Colors';
import FeatherIcon from './FeatherIcon';
import FontAwesomeIcon from './FontAwesomeIcon';

const MenuOption = ({ title, divider, materialIcon, fontAwesomeIcon, featherIcon, iconName, iconSize, onPress }) => (
    <View style={divider && styles.divider}>
        <TouchableOpacity 
        style={styles.container}
        onPress={onPress}>
            { materialIcon && <MaterialIcon
                name={iconName}
                color={Colors.green}
                size={iconSize}
                style={styles.iconStyle}
            /> }
            {
                featherIcon && <FeatherIcon
                    name={iconName}
                    color={Colors.green}
                    size={iconSize}
                    style={styles.iconStyle}
                />
            }
            {
                fontAwesomeIcon && <FontAwesomeIcon
                    name={iconName}
                    color={Colors.green}
                    size={iconSize}
                    style={styles.iconStyle}
                />
            }
            <AvenirMedium style={styles.title}>
                { title }
            </AvenirMedium>
        </TouchableOpacity>
    </View>
);
 const styles = StyleSheet.create({
     divider: {
         borderBottomColor: 'gray',
         borderBottomWidth: 0.5
     },
     container: {
         flexDirection: 'row',
         alignItems: 'center',
         padding: 18,
     },
     iconStyle: { 
         marginRight: 20 
    },
    title: { 
        fontSize: 15.5 
    }
 });
export default MenuOption;
