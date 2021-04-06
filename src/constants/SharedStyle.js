import { Platform } from 'react-native';
import Colors from '../constants/Colors';
import { StyleSheet } from 'react-native';

export default SharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
    },
    text: {
        marginHorizontal: 20,
        marginBottom: 5,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 5,
        fontFamily: 'AvenirLTStd-Medium',
        fontWeight: 'normal',
        marginHorizontal: 20,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowRadius: 3,
                shadowOffset: { height: 5 },
                shadowOpacity: 0.1,
            },
            android: {
                elevation: 3,
            },
        })
    },
    placesContainer: {
        position: 'absolute',
        top: 0,
        backgroundColor: Colors.background,
        width: '100%'
    },
    placesTextInputContainer: {
        width: '100%',
        height: 80,
        backgroundColor: Colors.background,
        borderTopWidth: 0,
    },
    placesTextInput: {
        height: 60,
        backgroundColor: 'white',
        fontFamily: 'AvenirLTStd-Book',
        color: Colors.green
    },
    placesListView: {
        backgroundColor: Colors.background
    },
    placesConfirmButtonContainer: {
        position: 'absolute',
        bottom: 20
    },
    map: {
        flex: 1
    },
    activityIndicatorMap: { 
        marginTop: 10, 
        marginBottom: 20 
    },
    textAddressMap: {
        marginHorizontal: 10,
    },
    infoText: {
        backgroundColor: 'white',
        borderRadius: 5,
        paddingHorizontal: 5,
        paddingVertical: 10,
        fontWeight: '100',
        color: 'silver',
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowRadius: 3,
                shadowOffset: { height: 5 },
                shadowOpacity: 0.1,
            },
            android: {
                elevation: 3,
            },
        })
    },
    labelText: {
        marginBottom: 5,
    },
    emptyComponent: {
        alignItems: 'center',
        margin: 20,
        flex: 1,
        justifyContent: 'center'
    },
    textEmptyComponent: {
        fontSize: 20,
        textAlign: 'center',
        lineHeight: 26,
        color: 'lightgray'
    },
    countContainer: {
        textAlign: 'right',
        marginRight: 20,
        marginTop: 10
    }
});