import React from 'react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import AuthLoadingScreen from '../screens/auth/AuthLoadingScreen';
import { createStackNavigator } from 'react-navigation-stack';
import Colors from '../constants/Colors';
import AppDrawerNavigator from './AppDrawerNavigator';

const AuthStack = createStackNavigator({ 
    SignIn: SignInScreen,
    SignUp: {
        screen: SignUpScreen,
        navigationOptions: {
            title: 'Registro',
            headerStyle: {
                backgroundColor: Colors.background
            },
            headerTitleStyle: {
                fontFamily: 'AvenirLTStd-Heavy',
            }
        }
    }
}, {
    initialRouteName: 'SignIn'
});

export default createAppContainer(createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        Auth: AuthStack,
        App: AppDrawerNavigator,
    },
    {
        initialRouteName: 'AuthLoading',
    }
));