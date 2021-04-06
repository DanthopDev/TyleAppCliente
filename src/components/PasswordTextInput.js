import React, { Component } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import SharedStyle from '../constants/SharedStyle';
import Icon from 'react-native-vector-icons/Entypo';

class PasswordTextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isVisiblePassword: true
    };
  }

  focus() {
    this.textInput.focus()
  }

  render() {
    const { isVisiblePassword }= this.state;
    const { placeholder, onChangeText, styleContainer, value, blurOnSubmit, onSubmitEditing, returnKeyType } =this.props;
    return (
      <View style={[SharedStyle.input, styles.container, styleContainer]}>
        <TextInput
            value={value}
            placeholder={placeholder}
            style={styles.passwordInput}
            onChangeText={onChangeText}
            secureTextEntry={isVisiblePassword}
            autoCompleteType={'password'}
            maxLength={50}
            blurOnSubmit={blurOnSubmit}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            ref = { input => this.textInput = input}
    />
        <TouchableOpacity onPress={()=> this.setState({ isVisiblePassword: !isVisiblePassword })}>
            { isVisiblePassword== true  ? 
                    <Icon
                        name="eye-with-line"
                        size={22}
                        color="black"
                    /> : <Icon
                        name="eye"
                        size={22}
                        color="black"
                    />
            }
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingRight: 10 
    },
    passwordInput: {
        padding: 0,
        width: '88%',
        fontFamily: 'AvenirLTStd-Medium',
        fontWeight: 'normal'
    }
});

export default PasswordTextInput;
