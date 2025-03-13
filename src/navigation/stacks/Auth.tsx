import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import { LoginScreen } from '../../screens';

const Stack = createNativeStackNavigator();
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;