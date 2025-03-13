/* eslint-disable react/no-unstable-nested-components */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import { MainScreen, TasksScreen, TicketsScreen } from '../../screens';

const Tab = createBottomTabNavigator();

const TabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
      }}
      initialRouteName="Main">

      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          headerShown: false,
          tabBarActiveTintColor: '#45315F',
          tabBarInactiveTintColor: '#A7A5AC',
        }}
      />
        <Tab.Screen
        name="Main"
        component={MainScreen}
        options={{
          tabBarLabel: 'Main',
          headerShown: false,
          tabBarActiveTintColor: '#45315F',
          tabBarInactiveTintColor: '#A7A5AC',
        }}
      />

      <Tab.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{
          tabBarLabel: 'Tickets',
          headerShown: false,
          tabBarActiveTintColor: '#45315F',
          tabBarInactiveTintColor: '#A7A5AC',
        }}
      />
    </Tab.Navigator>
  );
};
export default TabsNavigator;