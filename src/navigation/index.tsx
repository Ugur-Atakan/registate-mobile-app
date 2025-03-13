import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {useAppSelector} from '../store/hooks';
import UserStack from './stacks/User';
import AuthStack from './stacks/Auth';

const Stack = createNativeStackNavigator();

const Navigator = () => {
  const {isLoggedIn} = useAppSelector(state => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isLoggedIn ? (
          <Stack.Screen name="UserStack" component={UserStack} />
        ) : (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;