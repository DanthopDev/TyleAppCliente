import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from "react-native-modal";
import PrimaryButton from '../components/PrimaryButton';
import Colors from '../constants/Colors';
import CheckBox from './CheckBox';

export default class SelectMethodOfPayment extends Component {
  constructor(props) {
    super(props);
    this.state={
        checkedCreditCard: true,
        checkedStore: false,
        checkedDeposit: false,
    }
  }
    componentDidUpdate(prevProps) {
       
    }

    onConfirmPressed= () => {
        const { checkedCreditCard, checkedStore, checkedDeposit } = this.state;
        let selected='';
        if(checkedCreditCard==true){
            selected='credit_card';
        }
        if(checkedStore==true){
            selected='store';
        }
        if(checkedDeposit==true){
            selected='deposit';
        }
        this.props.onConfirmPressed(selected);
    }

    onPressCheckBoxCreditCard = () => {
        this.setState({
            checkedCreditCard: true,
            checkedStore: false,
            checkedDeposit: false
        });
    }
    onPressCheckBoxStore = () => {
        this.setState({
            checkedCreditCard: false,
            checkedStore: true,
            checkedDeposit: false
        });
    }
    onPressCheckBoxDeposit = () => {
        this.setState({
            checkedCreditCard: false,
            checkedStore: false,
            checkedDeposit: true
        });
    }
    render() {
        const { confirmText, cancelText, isVisible, onCancelPressed } = this.props;
        const { checkedCreditCard, checkedStore, checkedDeposit }=this.state;
        return (
            <Modal isVisible={isVisible}>
                <View style={styles.content}>
                    <Text style={styles.contentTitle}>Seleccione un método de pago</Text>
                    <View style={{ height: 80, marginBottom: 30 }}>
                        <CheckBox
                            isChecked={checkedCreditCard}
                            onPress={this.onPressCheckBoxCreditCard}
                            text={'Tarjeta bancaria'}
                        />
                        <CheckBox
                            isChecked={checkedStore}
                            onPress={this.onPressCheckBoxStore}
                            text={'Tienda de auto servicio'}
                        />
                        <CheckBox
                            isChecked={checkedDeposit}
                            onPress={this.onPressCheckBoxDeposit}
                            text={'Depósito en ventanilla'}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            onTouch={this.onConfirmPressed}
                            buttonContainer={styles.customButtonContainer}
                            buttonStyle={[styles.button, { padding: 10 }]}
                            title={confirmText}
                        />
                        <PrimaryButton
                                onTouch={onCancelPressed}
                                buttonContainer={styles.customButtonContainer}
                                color={Colors.pink}
                                buttonStyle={[styles.button, { padding: 10 }]}
                                title={cancelText}
                            />
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
    row: {
        marginHorizontal: 20,
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