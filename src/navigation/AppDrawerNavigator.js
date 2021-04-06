import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import Sidebar from '../components/Sidebar';
import HomeScreen from '../screens/app/HomeScreen';
import EditProfileScreen from '../screens/app/EditProfileScreen';
import PendingServicesScreen from '../screens/app/PendingServicesScreen';
import HelpScreen from '../screens/app/HelpScreen';
import ServiceHistoryScreen from '../screens/app/ServiceHistoryScreen';
import SuggestionsScreen from '../screens/app/SuggestionsScreen';
import DetailedInformationScreen from '../screens/app/DetailedInformationScreen';
import ExtraDetailsScreen from '../screens/app/ExtraDetailsScreen';
import PayCreditCardScreen from '../screens/app/PayCreditCardScreen';
import TrackingScreen from '../screens/app/TrackingScreen';

const HomeStack = createStackNavigator({
    Home: {
        screen: HomeScreen, 
    },
    DetailedInformation: {
        screen: DetailedInformationScreen
    },
    ExtraDetails: {
        screen: ExtraDetailsScreen
    }
},{
    initialRouteName: 'Home',
    headerMode: 'none',
});

const PendingServicesStack = createStackNavigator({
    PendingServices: {
        screen: PendingServicesScreen
    },
    Tracking: {
        screen: TrackingScreen
    },
    PayCreditCard: {
        screen: PayCreditCardScreen
    }
}, {
    initialRouteName: 'PendingServices',
    headerMode: 'none',
});

const HelpStack = createStackNavigator({
    Help: {
        screen: HelpScreen
    },
    Suggestions: {
        screen: SuggestionsScreen
    }
}, {
    initialRouteName: 'Help',
    headerMode: 'none',
});

const AppDrawerNavigator = createDrawerNavigator({
    HomeStack: {
        screen: HomeStack,
    },
    EditProfile: {
        screen: EditProfileScreen
    },
    PendingServicesStack: {
        screen: PendingServicesStack
    },
    Help: {
        screen: HelpStack
    },
    ServiceHistory: {
        screen: ServiceHistoryScreen
    }
}, {
    initialRouteName: 'HomeStack',
    contentComponent: props => <Sidebar {...props} />,
});

const App = createAppContainer(AppDrawerNavigator);


export default createAppContainer(App);