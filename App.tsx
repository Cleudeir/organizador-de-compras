// index.tsx
import 'react-native-gesture-handler'; // Import this line at the top
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TodoScreen from './src/screens/TodoScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import {LogBox} from 'react-native';

const Stack = createStackNavigator();

const App: React.FC = () => {
  LogBox.ignoreAllLogs();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Lista de compras" component={TodoScreen} />
        <Stack.Screen name="Categorias" component={CategoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
