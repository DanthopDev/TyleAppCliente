/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import bgMessaging from './src/bgMessaging';

AppRegistry.registerComponent(appName, () => gestureHandlerRootHOC(App));
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging); 