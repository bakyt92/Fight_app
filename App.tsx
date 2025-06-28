/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StyleSheet, StatusBar, ActivityIndicator, View, Text } from 'react-native';

// Import screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainScreen from './src/screens/MainScreen';
import ChatScreen from './src/screens/ChatScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import FightScreen from './src/screens/FightScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import services
import StorageService from './src/services/StorageService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom icon component using text symbols
const TabIcon = ({ symbol, focused, color }: { symbol: string; focused: boolean; color: string }) => (
  <Text style={{ 
    fontSize: focused ? 26 : 22, 
    color: color,
    fontWeight: focused ? 'bold' : 'normal'
  }}>
    {symbol}
  </Text>
);

// Stack Navigator for Fight tab (includes MainScreen and ChatScreen)
const FightStackNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false, // We'll handle headers in individual screens
      }}
    >
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen 
        name="AnalysisScreen" 
        component={AnalysisScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen}
        options={{ headerShown: true, title: 'Chat' }}
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator for main app
const MainTabNavigator = () => {
  return (
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
          component={FightStackNavigator}
          options={{
            title: 'Fight Mode',
            tabBarLabel: 'Fight',
            headerShown: false, // Stack navigator handles headers
            tabBarIcon: ({ color, focused }) => (
              <TabIcon symbol="⚔️" focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen}
          options={{
            title: 'History',
            tabBarLabel: 'History',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon symbol="📋" focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon symbol="⚙️" focused={focused} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Simple Onboarding Wrapper
const OnboardingWrapper = () => {
  return (
    <NavigationContainer>
      <OnboardingScreen />
    </NavigationContainer>
  );
};

function App(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
    
    // Set up periodic check for onboarding completion
    const interval = setInterval(() => {
      checkOnboardingStatus();
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const userProfile = await StorageService.getUserProfile();
      const newStatus = userProfile?.hasCompletedOnboarding || false;
      
      // Only update if status changed to avoid unnecessary re-renders
      if (newStatus !== hasCompletedOnboarding) {
        setHasCompletedOnboarding(newStatus);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#ff4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {hasCompletedOnboarding ? (
        <MainTabNavigator />
      ) : (
        <OnboardingWrapper />
      )}
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
