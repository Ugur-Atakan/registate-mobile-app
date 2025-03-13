import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import TabsNavigator from './BottomTabs';

const Stack = createNativeStackNavigator();
const UserStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
    </Stack.Navigator>
  );
};

export default UserStack;