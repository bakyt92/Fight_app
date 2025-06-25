/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';

import FightScreen from './src/screens/FightScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function App(): JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#ff4444',
            tabBarInactiveTintColor: '#6c757d',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e9ecef',
              paddingTop: 8,
              paddingBottom: 8,
              height: 70,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginTop: 4,
            },
            headerStyle: {
              backgroundColor: '#ffffff',
              borderBottomWidth: 1,
              borderBottomColor: '#e9ecef',
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: 'bold',
              color: '#212529',
            },
            headerTintColor: '#ff4444',
          }}
        >
                     <Tab.Screen 
             name="Fight" 
             component={FightScreen}
             options={{
               title: '🥊 Fight Mode',
               tabBarLabel: 'Fight',
             }}
           />
           <Tab.Screen 
             name="History" 
             component={HistoryScreen}
             options={{
               title: '⚔️ Battle History',
               tabBarLabel: 'History',
             }}
           />
           <Tab.Screen 
             name="Settings" 
             component={SettingsScreen}
             options={{
               title: '⚙️ Settings',
               tabBarLabel: 'Settings',
             }}
           />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default App;
