import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, BackHandler } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth } from '@/src/config/firebase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Handle hardware back button for Android
  useEffect(() => {
    const backAction = () => {
      const currentSegment = segments[segments.length - 1];
      
      // Exit app from home screen
      if (currentSegment === 'home') {
        BackHandler.exitApp();
        return true;
      }
      
      // From any other screen go directly to home
      if (
        currentSegment !== 'index' &&
        currentSegment !== 'otp' &&
        currentSegment !== 'welcome'
      ) {
        router.replace('/home');
        return true;
      }
      
      // Login screens exit app
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [segments]);

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)' || segments.length === 0 || segments[0] === 'index' || segments[0] === 'otp';

    if (user && inAuthGroup) {
      // If user is logged in and trying to access login/otp, send to home
      router.replace('/home');
    } else if (!user && !inAuthGroup) {
      // If user is NOT logged in and trying to access protected pages, send to login
      router.replace('/');
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0F14' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="otp" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
