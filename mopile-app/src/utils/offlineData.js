import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const QURAN_CACHE_KEY = 'offline_quran_surahs';
const AZKAR_CACHE_KEY = 'offline_azkar_data';
const SURAH_PREFIX = 'offline_surah_';
const JUZ_PREFIX = 'offline_juz_';

export const offlineData = {
    // Preload Surah List
    preloadQuran: async () => {
        try {
            const response = await axios.get('https://api.alquran.cloud/v1/surah');
            await AsyncStorage.setItem(QURAN_CACHE_KEY, JSON.stringify(response.data.data));
            return response.data.data;
        } catch (e) {
            console.error('Quran Cache Error:', e);
            return null;
        }
    },

    // Save specific surah ayahs
    saveSurah: async (number, ayahs) => {
        try {
            await AsyncStorage.setItem(`${SURAH_PREFIX}${number}`, JSON.stringify(ayahs));
        } catch (e) {
            console.error('Save Surah Error:', e);
        }
    },

    getSurah: async (number) => {
        try {
            const data = await AsyncStorage.getItem(`${SURAH_PREFIX}${number}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    saveJuz: async (number, ayahs) => {
        try {
            await AsyncStorage.setItem(`${JUZ_PREFIX}${number}`, JSON.stringify(ayahs));
        } catch (e) {
            console.error('Save Juz Error:', e);
        }
    },

    getJuz: async (number) => {
        try {
            const data = await AsyncStorage.getItem(`${JUZ_PREFIX}${number}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    preloadAzkar: async () => {
        try {
            const response = await axios.get('https://raw.githubusercontent.com/osamayy/azkar-db/master/azkar.json');
            const rows = response.data.rows || [];
            const grouped = rows.reduce((acc, row) => {
                const catName = row[0];
                if (row[1] && row[1].trim() !== '') { // Only add if content is not empty
                    if (!acc[catName]) acc[catName] = [];
                    acc[catName].push({
                        content: row[1],
                        description: row[2],
                        count: row[3],
                        reference: row[4]
                    });
                }
                return acc;
            }, {});

            const cats = Object.keys(grouped)
                .filter(name => grouped[name].length > 0) // Only keep non-empty categories
                .map((name, index) => ({
                    id: index,
                    name: name,
                    data: grouped[name],
                }));

            await AsyncStorage.setItem(AZKAR_CACHE_KEY, JSON.stringify(cats));
            return cats;
        } catch (e) {
            console.error('Azkar Cache Error:', e);
            return null;
        }
    },

    getQuran: async () => {
        const data = await AsyncStorage.getItem(QURAN_CACHE_KEY);
        return data ? JSON.parse(data) : null;
    },

    getAzkar: async () => {
        const data = await AsyncStorage.getItem(AZKAR_CACHE_KEY);
        return data ? JSON.parse(data) : null;
    }
};
