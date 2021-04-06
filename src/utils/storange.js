import AsyncStorage from '@react-native-community/async-storage';

export const _storeData = async (keyName,info) => {
    try {
        await AsyncStorage.setItem(keyName, info);
        return 'saved';
    } catch (error) {
        console.log(error, 'Error al guaradar la información en la Storage');
        return error;
    }
};

export const _getStoreData = async (keyName) => {
        const info = await AsyncStorage.getItem(keyName);
        return info
}
