import React, { Component } from 'react';
import { View, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import SharedStyle from '../../constants/SharedStyle';
import Header from '../../components/Header';
import { AvenirMedium, AvenirBook } from '../../components/StyledText';
import PrimaryButton from '../../components/PrimaryButton';
import CustomAlert from '../../components/CustomAlert';
import { sendSuggestionApi } from '../../utils/APIs';

class SuggestionsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            descripcion: '',
            showTitle: false,
            isVisibleAlert: false,
            isLoading: false,
            title: '',
            showSuccessAlert: false,
            message: '',
        };
    }
    onValidate = () => {
        const { descripcion } = this.state;
        if (descripcion == '') {
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                showTitle: false,
                message: 'Ingrese sus comentarios, asegurese de completar este campo',
            });
        } else {
            this.setState({
                isVisibleAlert: true,
                showSuccessAlert: false,
                isLoading: true,
                showTitle: false,
                message: 'Enviando tus comentarios...',
            });
            this.sendSuggestion();
        }
    }

    sendSuggestion() {
        const { descripcion } = this.state;
        sendSuggestionApi(descripcion).then(response => {
            console.log('============ SUGGESTION RESPONSE ====================');
            console.log(response);
            if (response.message == 'Successfully') {
                this.setState({
                    isLoading: false,
                    showSuccessAlert: true,
                    isVisibleAlert: true,
                    showTitle: true,
                    title: 'Gracias por tu comentario',
                    message: 'Con esto, nos ayudas a mejorar nuestro servicio',
                    descripcion: ''
                });
            }
        }).catch(error => {
            this.setState({
                isLoading: false,
                showSuccessAlert: false,
                isVisibleAlert: true,
                showTitle: false,
                message: 'Send Help Catch Errors, ' + JSON.stringify(error)
            })
        })
    }

    render() {
        const { descripcion, isVisibleAlert, isLoading, showSuccessAlert, message, showTitle, title } = this.state;
        const { navigation } = this.props;
        return (
            <View style={SharedStyle.container}>
                <Header
                    title={'Quejas y Sugerencias'}
                    leftIconName='menu'
                    leftIconSize={26}
                    leftIconType='entypo'
                    onPressLeftIcon={() => navigation.openDrawer()}
                />
                <KeyboardAvoidingView style={SharedStyle.container} behavior="padding" enabled keyboardVerticalOffset={-500}>
                    <ScrollView>
                        <AvenirMedium style={SharedStyle.text}>
                            Comentarios:
                        </AvenirMedium>
                        <TextInput
                            value={descripcion}
                            placeholder={'escriba aquí'}
                            style={SharedStyle.input}
                            onChangeText={(descripcion) => this.setState({ descripcion })}
                            maxLength={250}
                            multiline={true}
                            numberOfLines={6}
                            returnKeyType={"done"}
                        />
                        <AvenirBook style={SharedStyle.countContainer}>
                            {descripcion.length} / 250
                        </AvenirBook>
                        <PrimaryButton
                            title={'Enviar'}
                            buttonStyle={styles.sendButton}
                            onTouch={this.onValidate}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
                <CustomAlert
                    isVisible={isVisibleAlert}
                    showTitle={showTitle}
                    title={title}
                    message={message}
                    isLoading={isLoading}
                    showSuccessIcon={showSuccessAlert}
                    confirmText={'Aceptar'}
                    onConfirmPressed={() => this.setState({ isVisibleAlert: false })}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    sendButton: {
        marginTop: 50,
        marginBottom: 0
    }
});

export default SuggestionsScreen;