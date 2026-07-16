import 'regenerator-runtime/runtime';
import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('TransEatApp', () => App);
AppRegistry.runApplication('TransEatApp', {
  rootTag: document.getElementById('root'),
});