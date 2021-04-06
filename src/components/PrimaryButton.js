import React, { Component } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Colors from '../constants/Colors';

class PrimaryButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { color, onTouch, title, buttonContainer, buttonStyle, buttonTitleStyle }=this.props;
    return (
    <View style={[styles.container, buttonContainer]}>
        <TouchableOpacity onPress={onTouch} style={[styles.button, buttonStyle, { backgroundColor: color ? color : Colors.green }]}>
            <Text style={[styles.title, buttonTitleStyle]}>{title}</Text>
        </TouchableOpacity>
    </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    button: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20, 
        marginRight: 20,
    },
    title:{
        color: 'white',
        fontSize: 16,
        fontFamily: 'AvenirLTStd-Heavy',
    },
});

export default PrimaryButton;
