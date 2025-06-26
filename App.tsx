/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, StyleSheet, StatusBar, ActivityIndicator, View } from 'react-native';

// Import screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainScreen from './src/screens/MainScreen';
import ChatScreen from './src/screens/ChatScreen';
import FightScreen from './src/screens/FightScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import services
import StorageService from './src/services/StorageService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main app
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
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
        headerTintColor: '#007bff',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={MainScreen}
        options={{
          title: '🏠 Home',
          tabBarLabel: 'Home',
          headerShown: false, // MainScreen handles its own header
        }}
      />
      <Tab.Screen 
        name="Legacy" 
        component={FightScreen}
        options={{
          title: '🥊 Legacy Mode',
          tabBarLabel: 'Legacy',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          title: '📚 History',
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
  );
};

function App(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const userProfile = await StorageService.getUserProfile();
      setHasCompletedOnboarding(userProfile?.hasCompletedOnboarding || false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={hasCompletedOnboarding ? "MainApp" : "Onboarding"}
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Onboarding Flow */}
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{
              gestureEnabled: false,
            }}
          />
          
          {/* Main App with Tabs */}
          <Stack.Screen 
            name="MainApp" 
            component={MainTabNavigator}
          />
          
          {/* Individual Screens */}
          <Stack.Screen 
            name="MainScreen" 
            component={MainScreen}
          />
          
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{
              headerShown: false,
              gestureEnabled: true,
            }}
          />
          
          {/* Processing and Text Input Screens (you can create these later) */}
          <Stack.Screen 
            name="ProcessingScreen" 
            component={MainScreen} // Placeholder, replace with actual ProcessingScreen
            options={{
              title: 'Processing...',
              headerShown: true,
            }}
          />
          
          <Stack.Screen 
            name="TextInputScreen" 
            component={ChatScreen} // This will handle text input mode
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default App;
