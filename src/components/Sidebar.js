import React, { Component } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import SharedStyle from '../constants/SharedStyle';
import { AvenirHeavy } from './StyledText';
import MenuOption from './MenuOption'; 
import CustomAlert from './CustomAlert';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import { logoutApi } from '../utils/APIs';
import Colors from '../constants/Colors';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import UrlBaseImage from '../constants/UrlBaseImage';

class Sidebar extends Component {
  constructor(props) {
    super(props);
      const { cliente, name } = this.props.session.user;
    this.state = {
        isVisibleAlert: false,
        message: ''
    };
  }
  logout= async () => {
      this.setState({
          isVisibleAlert: true,
          message: 'Cerrando sesión...'
      });
      if(this.props.isConnected){
          let response= await logoutApi();
          if (response.message) {
              if (response.message !== 'Successfully logged out') {
                  Alert.alert('Error al cerrar sesión', JSON.stringify(response));
              }
          } else {
              Alert.alert('Error al cerrar sesión', JSON.stringify(response));
          }
          await this.setState({
              isVisibleAlert: false,
          });
          AsyncStorage.clear();
          this.props.navigation.navigate('Auth');
      }else {
          await this.setState({
              isVisibleAlert: false,
          });
          AsyncStorage.clear();
          this.props.navigation.navigate('Auth');
      }
  }
  render() {
    const { cliente, name }=this.props.session.user;
    const { navigation }=this.props;
    const { isVisibleAlert, message }=this.state;
    return (
      <ScrollView style={SharedStyle.container}>
        <View style={styles.imageContainer}>
            <View>
                <Image
                    style={styles.image}
                    resizeMode={'cover'}
                    source={cliente.foto == null || cliente.foto == 'null' ? require('../../assets/images/default_user.png') : {
                        uri: UrlBaseImage + cliente.foto
                    }}
                />
                <TouchableOpacity
                    style={styles.editImage}
                    onPress={() => {
                        navigation.closeDrawer();
                        navigation.navigate('EditProfile')
                    }}>
                    <Icon
                        name={'account-edit'}
                        color={'white'}
                        size={20}
                    />
                </TouchableOpacity>
            </View>
                <AvenirHeavy style={styles.nameProfile}>
                    { name }
                </AvenirHeavy>
            </View>
            <View style={styles.menuOptionsContainer}>
                <MenuOption
                    title={'Inicio'}
                    divider
                    materialIcon
                    iconName={'home'}
                    iconSize={20}
                    onPress={()=> {
                        navigation.closeDrawer();
                        navigation.navigate('HomeStack');
                    }}
                />
                <MenuOption
                    title={'Servicios Pendientes'}
                    divider
                    featherIcon
                    iconName={'watch'}
                    iconSize={20}
                    onPress={() => {
                        navigation.closeDrawer();
                        navigation.navigate('PendingServicesStack');
                    }}
                />
                <MenuOption
                    title={'Historial de Servicios'}
                    divider
                    featherIcon
                    iconName={'clock'}
                    iconSize={20}
                    onPress={() => {
                        navigation.closeDrawer();
                        navigation.navigate('ServiceHistory');
                    }}
                />
                <MenuOption
                    title={'Ayuda'}
                    divider
                    featherIcon
                    iconName={'help-circle'}
                    iconSize={20}
                    onPress={() => {
                        navigation.closeDrawer();
                        navigation.navigate('Help');
                    }}
                />
                <MenuOption
                    title={'Quejas y Sugerencias'}
                    divider
                    fontAwesomeIcon
                    iconName={'comments-o'}
                    iconSize={20}
                    onPress={() => {
                        navigation.closeDrawer();
                        navigation.navigate('Suggestions');
                    }}
                />
                <MenuOption
                    title={'Cerrar Sesión'}
                    featherIcon
                    iconName={'log-out'}
                    iconSize={20}
                    onPress={this.logout}
                />
            </View>
            <CustomAlert
                isVisible={isVisibleAlert}
                message={message}
                isLoading={true}
                confirmText={'Aceptar'}
                onConfirmPressed={() => this.setState({ isVisibleAlert: false })}
            />
      </ScrollView>
    );
  }
}
const mapStateToProps = state => ({
    session: state.reducerSession,
    isConnected: state.reducerIsConnected,
});

const mapDispatchToProps = dispatch => ({
    
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);

const styles = StyleSheet.create({
    image: {
        marginTop: 20,
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 20
    },
    menuOptionsContainer: {
        marginTop: 30
    },
    nameProfile: {
        fontSize: 17,
        marginTop: 8,
        lineHeight: 20,
        textAlign: 'center'
    },
    editImage: {
        width: 40,
        height: 40,
        backgroundColor: Colors.green,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: 9,
        borderWidth: 5,
        borderColor: Colors.background,
        bottom: 5
    }
});
