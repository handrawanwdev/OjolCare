/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerHeadlessTask } from './src/bgTasks';

// Daftarkan headless task untuk BackgroundFetch
registerHeadlessTask();

AppRegistry.registerComponent(appName, () => App);