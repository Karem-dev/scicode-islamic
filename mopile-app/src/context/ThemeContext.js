import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../constants/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [currentTheme, setCurrentTheme] = useState(themes.Dark);

    useEffect(() => {
        AsyncStorage.getItem('app_theme').then(saved => {
            if (saved && themes[saved]) setCurrentTheme(themes[saved]);
        });
    }, []);

    const toggleTheme = async (name) => {
        if (!themes[name]) return;
        setCurrentTheme(themes[name]);
        await AsyncStorage.setItem('app_theme', name);
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
