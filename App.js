/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { 
  StatusBar,
} from 'react-native';
import { Provider } from 'react-redux';
import store from './src/store/store';
import AppContainer from './src/AppContainer';

const App: () => React$Node = () => {
  return (
    <>
      <Provider store={store}>
          <AppContainer/>
      </Provider>
    </>
  );
};

export default App;
