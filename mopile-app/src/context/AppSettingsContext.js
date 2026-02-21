import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Brightness from 'expo-brightness';
import { Platform } from 'react-native';

const AppSettingsContext = createContext();

const DEFAULTS = {
    fontSize: 'medium',
    autoAdvance: true,
    keepScreenOn: false,
    hapticFeedback: true,
    brightness: 0.8,   // 0.05 → 1.0
};

const STORAGE_KEY = 'app_settings';

// ── Apply brightness safely (handles permissions) ───────────────────────────
async function applyBrightness(value) {
    try {
        if (Platform.OS === 'android') {
            // Check if we have permission to change system brightness
            const { status } = await Brightness.requestPermissionsAsync();
            if (status === 'granted') {
                await Brightness.setSystemBrightnessAsync(value);
            } else {
                // Fallback: change only current activity brightness (no permission needed)
                await Brightness.setBrightnessAsync(value);
            }
        } else {
            // iOS: no permission needed
            await Brightness.setBrightnessAsync(value);
        }
    } catch (e) {
        // Last resort: activity-level brightness
        try { await Brightness.setBrightnessAsync(value); } catch (_) { }
    }
}

export function AppSettingsProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULTS);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const merged = { ...DEFAULTS, ...parsed };
                    setSettings(merged);
                    // Apply brightness from saved settings on app start
                    if (merged.brightness !== undefined) {
                        await applyBrightness(merged.brightness);
                    }
                }
            } catch (_) { }
        })();
    }, []);

    const updateSetting = async (key, value) => {
        const next = { ...settings, [key]: value };
        setSettings(next);

        // Apply brightness change immediately in real-time
        if (key === 'brightness') {
            await applyBrightness(value);
        }

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const resetSettings = async () => {
        setSettings(DEFAULTS);
        await applyBrightness(DEFAULTS.brightness);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
    };

    return (
        <AppSettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export const useAppSettings = () => useContext(AppSettingsContext);

// Font size multipliers
export const FONT_SCALE = {
    small: 0.85,
    medium: 1.0,
    large: 1.2,
    xlarge: 1.4,
};
