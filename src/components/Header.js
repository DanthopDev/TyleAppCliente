import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import EntypoIcon from './EntypoIcon';
import Colors from '../constants/Colors';
import { AvenirHeavy } from './StyledText';
import FontAwesomeIcon from './FontAwesomeIcon';
import FeatherIcon from './FeatherIcon';

const Header = ({
    title,
    showRightIcon,
    rightIconName,
    rightIconType,
    rightIconSize,
    onPressRightIcon,
    leftIconName,
    leftIconType,
    leftIconSize,
    onPressLeftIcon,
}) => (
        <View style={styles.container}>
            <View style={styles.iconsContainer}>
                <TouchableOpacity onPress={onPressLeftIcon} style={{}, leftIconName == 'chevron-left' && styles.backStyle}>
                {
                        leftIconType == 'entypo' && <EntypoIcon
                            size={leftIconSize}
                            color={Colors.green}
                            name={leftIconName}
                        />
                }
                {
                        leftIconType == 'feather' && <FeatherIcon
                            size={leftIconSize}
                            color={Colors.green}
                            name={leftIconName}
                        />
                }
                    {
                        leftIconType == 'font-awesome' && <FontAwesomeIcon
                            size={leftIconSize}
                            color={Colors.green}
                            name={leftIconName}
                        />
                    }
                </TouchableOpacity>
                { showRightIcon && <TouchableOpacity onPress={onPressRightIcon}>
                    {
                        rightIconType == 'entypo' && <EntypoIcon
                            size={rightIconSize}
                            color={Colors.green}
                            name={rightIconName}
                        />
                    }
                    {
                        rightIconType == 'font-awesome' && <FontAwesomeIcon
                            size={rightIconSize}
                            color={Colors.green}
                            name={rightIconName}
                        />
                    }
                </TouchableOpacity> }
            </View>
            <AvenirHeavy style={{
                fontSize: 22,
                width: 240,
            }}>{title}</AvenirHeavy>
        </View>
);

const styles = StyleSheet.create({
    container: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
    },
    iconsContainer: {
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backStyle: {
        paddingRight: 10, 
        paddingBottom: 2
    }
});

export default Header;
