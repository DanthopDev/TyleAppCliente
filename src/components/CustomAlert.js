import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import Modal from "react-native-modal";
import PrimaryButton from '../components/PrimaryButton';
import FeatherIcon from '../components/FeatherIcon';
import Colors from '../constants/Colors';
import Icon from "react-native-vector-icons/Ionicons";

export default class CustomAlert extends Component {
  constructor(props) {
    super(props);
  }

    render() {
        const { isVisible, onConfirmPressed, title, confirmText, message, showTitle, showSuccessIcon, showCancelButton, onCancelPressed, cancelText, isLoading } = this.props;
        return (
                <Modal isVisible={isVisible}>
                    <View style={styles.content}>
                    {
                            isLoading ? <ActivityIndicator size="large"  /> : showSuccessIcon ? showSuccessIcon ==true && <Icon 
                                name={'ios-checkmark-circle-outline'}
                                color={'#00ACDC'}
                                size={65}
                            /> : <FeatherIcon
                                    name={'alert-circle'}
                                    color={Colors.pink}
                                    size={65}
                                />
                    }
                        { showTitle && <Text style={styles.contentTitle}>{title}</Text>  }
                        <Text style={[styles.contentMessage, !showTitle && { marginTop: 15, marginBottom: 20 } ]}>{ message }</Text>
                        
                        <View style={styles.buttonContainer}>
                            { isLoading ? null : <PrimaryButton
                                onTouch={onConfirmPressed}
                                buttonContainer={[showCancelButton && styles.customButtonContainer]}
                                buttonStyle={[styles.button, showCancelButton && { padding: 10 }]}
                                title={confirmText}
                            /> }
                            {
                              isLoading ? null : showCancelButton && <PrimaryButton
                                    onTouch={onCancelPressed}
                                    buttonContainer={[showCancelButton && styles.customButtonContainer]}
                                    color={Colors.pink}
                                    buttonStyle={[styles.button, showCancelButton && { padding: 10 }]}
                                    title={cancelText}
                                />
                            }
                        </View>
                    </View>
                </Modal>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    contentTitle: {
        fontSize: 20,
        marginBottom: 20,
        marginTop: 12,
        fontFamily: 'AvenirLTStd-Heavy',
        lineHeight: 24,
        textAlign: 'center'
    },
    contentMessage: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'AvenirLTStd-Book',
        lineHeight: 18
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    button: {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
    },
    customButtonContainer: {
        width: '45%'
    }
});