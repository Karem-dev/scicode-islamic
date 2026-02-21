import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppSettingsProvider } from './src/context/AppSettingsContext';
import HomeScreen from './src/screens/HomeScreen';
import PrayerTimesScreen from './src/screens/PrayerTimesScreen';
import AzkarScreen from './src/screens/AzkarScreen';
import AzkarReaderScreen from './src/screens/AzkarReaderScreen';
import QuranScreen from './src/screens/QuranScreen';
import SurahReaderScreen from './src/screens/SurahReaderScreen';
import FindMosqueScreen from './src/screens/FindMosqueScreen';
import KhatmahScreen from './src/screens/KhatmahScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

// ── Stack Navigators ──────────────────────────────────────────────────
function AzkarStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="AzkarList" component={AzkarScreen} />
      <Stack.Screen name="AzkarReader" component={AzkarReaderScreen} />
    </Stack.Navigator>
  );
}

function QuranStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="QuranList" component={QuranScreen} />
      <Stack.Screen name="SurahReader" component={SurahReaderScreen} />
    </Stack.Navigator>
  );
}

// ── Tab Icon ──────────────────────────────────────────────────────────
const TAB_CONFIG = {
  Home: { icon: 'home', label: 'الرئيسية' },
  Prayer: { icon: 'time', label: 'المواقيت' },
  Azkar: { icon: 'leaf', label: 'الأذكار' },
  Quran: { icon: 'book', label: 'القرآن' },
  Khatmah: { icon: 'checkmark-circle', label: 'الختمة' },
  Mosque: { icon: 'map', label: 'المساجد' },
  Settings: { icon: 'settings', label: 'الإعدادات' },
};

// ── Main App ──────────────────────────────────────────────────────────
function MainApp() {
  const { theme } = useTheme();
  const [onboarded, setOnboarded] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('has_onboarded').then(val => setOnboarded(val === 'true'));
  }, []);

  if (onboarded === null) return null;
  if (onboarded === false) return <WelcomeScreen onComplete={() => setOnboarded(true)} />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color }) => {
            const cfg = TAB_CONFIG[route.name];
            return (
              <View style={styles.tabIconWrap}>
                <Ionicons
                  name={focused ? cfg.icon : `${cfg.icon}-outline`}
                  size={22}
                  color={color}
                />
                {focused && <View style={[styles.tabDot, { backgroundColor: theme.primary }]} />}
              </View>
            );
          },
          tabBarLabel: ({ color }) => {
            const cfg = TAB_CONFIG[route.name];
            return (
              <Text style={[styles.tabLabel, { color }]}>{cfg.label}</Text>
            );
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textDim,
          tabBarStyle: {
            backgroundColor: theme.tabBar || theme.card,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            height: 72,
            paddingTop: 6,
            paddingBottom: 10,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
          },
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Prayer" component={PrayerTimesScreen} />
        <Tab.Screen name="Azkar" component={AzkarStack} />
        <Tab.Screen name="Quran" component={QuranStack} />
        <Tab.Screen name="Khatmah" component={KhatmahScreen} />
        <Tab.Screen name="Mosque" component={FindMosqueScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    Font.loadAsync({ 'Amiri-Regular': Amiri_400Regular, 'Amiri-Bold': Amiri_700Bold })
      .catch(console.warn)
      .finally(() => setAppIsReady(true));
  }, []);

  const onLayout = useCallback(async () => {
    if (appIsReady) await SplashScreen.hideAsync();
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <SafeAreaProvider onLayout={onLayout}>
      <ThemeProvider>
        <AppSettingsProvider>
          <MainApp />
        </AppSettingsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: 'center', justifyContent: 'center' },
  tabDot: { position: 'absolute', bottom: -6, width: 4, height: 4, borderRadius: 2 },
  tabLabel: { fontSize: 10, fontFamily: 'Amiri-Bold', marginTop: 2 },
});
