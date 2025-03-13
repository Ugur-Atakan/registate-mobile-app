import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import TabsNavigator from './BottomTabs';
import { CreateTaskScreen, TaskDetailsScreen, TicketDetailsScreen } from '../../screens';

const Stack = createNativeStackNavigator();
const UserStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <Stack.Screen name='CreateTask' component={CreateTaskScreen} />
    </Stack.Navigator>
  );
};

export default UserStack;