import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from './src/constants/theme';
import { SettingsProvider } from './src/context/SettingsContext';
import { registerForNotificationsAsync } from './src/utils/notifications';

import HomeScreen from './src/screens/HomeScreen';
import SubscriptionFormScreen from './src/screens/SubscriptionFormScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import InsightsScreen from './src/screens/InsightsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // Ask for notification permission once, on startup.
  useEffect(() => {
    registerForNotificationsAsync();
  }, []);

  return (
    <SettingsProvider>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.card },
            headerTintColor: COLORS.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SubscriptionForm"
            component={SubscriptionFormScreen}
            options={({ route }) => ({
              title: route.params?.subscription ? 'Edit Subscription' : 'Add Subscription',
              presentation: 'modal',
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
          <Stack.Screen
            name="Insights"
            component={InsightsScreen}
            options={{ title: 'Spending Insights' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}
