/* eslint-disable react/no-unstable-nested-components */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import { MainScreen, TasksScreen, TicketsScreen } from '../../screens';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


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
          tabBarIcon: ({color}) => (
            <FontAwesome5 name="tasks" size={24} color={color} />
          ),
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
          tabBarIcon: ({color}) => (
            <FontAwesome5 name="home" size={24} color={color} />
          ),
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
          tabBarIcon: ({color}) => (
            <MaterialIcons name="support-agent" size={24} color={color} />
          ),
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