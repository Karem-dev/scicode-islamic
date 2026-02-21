import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Modal, Linking, StatusBar,
    ActivityIndicator, Alert
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../constants/theme';
import { offlineData } from '../utils/offlineData';
import { LIST_PADDING_BOTTOM } from '../constants/layout';

const PRAYERS_LIST = [
    { n: 'الفجر', k: 'Fajr' }, { n: 'الظهر', k: 'Dhuhr' },
    { n: 'العصر', k: 'Asr' }, { n: 'المغرب', k: 'Maghrib' },
    { n: 'العشاء', k: 'Isha' },
];

const FEATURES = [
    { name: 'القرآن الكريم', icon: 'book', color: '#10b981', tab: 'Quran', desc: 'تلاوة وتدبر' },
    { name: 'مواقيت الصلاة', icon: 'time', color: '#fbbf24', tab: 'Prayer', desc: 'حسب موقعك' },
    { name: 'الأذكار', icon: 'leaf', color: '#f87171', tab: 'Azkar', desc: 'حصن المسلم' },
    { name: 'المساجد', icon: 'map', color: '#60a5fa', tab: 'Mosque', desc: 'الأقرب إليك' },
    { name: 'الختمة', icon: 'checkmark-circle', color: '#a78bfa', tab: 'Khatmah', desc: 'تابع تقدمك' },
];

const LINKS = [
    { lable: "المبرمج", name: 'Karem Mahmoud', url: 'https://karem-mahmoud.vercel.app/', icon: 'person-outline', color: '#6366f1' },
    { lable: "الاكاديميه", name: 'SciCode Academy', url: 'http://scicodeacademy.infinityfreeapp.com/', icon: 'school-outline', color: '#0ea5e9' },
];

export default function HomeScreen({ navigation }) {
    const { theme, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    const [lastRead, setLastRead] = useState(null);
    const [prayer, setPrayer] = useState(null);
    const [dailyZikr, setDailyZikr] = useState('سبحان الله وبحمده');
    const [showThemeModal, setShowThemeModal] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const lr = await AsyncStorage.getItem('last_read');
            if (lr) setLastRead(JSON.parse(lr));
        } catch (_) { }

        try {
            const res = await axios.get(
                'https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5',
                { timeout: 6000 }
            );
            const timings = res.data.data.timings;
            const now = new Date();
            const nowMin = now.getHours() * 60 + now.getMinutes();
            let next = { name: 'الفجر', time: timings.Fajr };
            for (const p of PRAYERS_LIST) {
                const [h, m] = timings[p.k].split(':').map(Number);
                if (h * 60 + m > nowMin) { next = { name: p.n, time: timings[p.k] }; break; }
            }
            setPrayer(next);
        } catch (_) { }

        try {
            const azkar = await offlineData.getAzkar();
            if (azkar?.length) {
                const cat = azkar[Math.floor(Math.random() * azkar.length)];
                if (cat?.data?.length) {
                    const z = cat.data[Math.floor(Math.random() * cat.data.length)];
                    if (z?.content) setDailyZikr(z.content.slice(0, 60));
                }
            }
        } catch (_) { }
    }, []);

    useEffect(() => { if (isFocused) loadData(); }, [isFocused, loadData]);

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: LIST_PADDING_BOTTOM + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── TOP BAR ── */}
                <View style={styles.topBar}>
                    <Text style={[styles.bismillah, { color: theme.text }]}>بسم الله الرحمن الرحيم</Text>
                    <TouchableOpacity
                        onPress={() => setShowThemeModal(true)}
                        style={[styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                        <Ionicons name="color-palette-outline" size={20} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.salat, { color: theme.text }]}>صَلِّ عَلَى مُحَمَّدٍ ﷺ</Text>

                {/* ── WIDGETS ROW ── */}
                <View style={styles.widgetsRow}>
                    {/* Prayer */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Prayer')}
                        style={[styles.widget, { backgroundColor: theme.card, borderColor: theme.border }]}
                        activeOpacity={0.8}
                    >
                        <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.widgetIcon}>
                            <Ionicons name="time" size={18} color="#fff" />
                        </LinearGradient>
                        <Text style={[styles.widgetLabel, { color: theme.textDim }]}>الصلاة القادمة</Text>
                        {prayer
                            ? <Text style={[styles.widgetValue, { color: theme.text }]} numberOfLines={1}>{prayer.name}  {prayer.time}</Text>
                            : <ActivityIndicator size="small" color={theme.primary} />
                        }
                    </TouchableOpacity>

                    {/* Zikr */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Azkar')}
                        style={[styles.widget, { backgroundColor: theme.card, borderColor: theme.border }]}
                        activeOpacity={0.8}
                    >
                        <LinearGradient colors={['#f43f5e', '#fb7185']} style={styles.widgetIcon}>
                            <Ionicons name="leaf" size={18} color="#fff" />
                        </LinearGradient>
                        <Text style={[styles.widgetLabel, { color: theme.textDim }]}>ذكر اليوم</Text>
                        <Text style={[styles.widgetValue, { color: theme.text }]} numberOfLines={1}>{dailyZikr}</Text>
                    </TouchableOpacity>
                </View>

                {/* ── CONTINUE READING BANNER ── */}
                {lastRead && (
                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={styles.banner}
                        onPress={() => navigation.navigate('Quran', { screen: 'SurahReader', params: { surahNumber: lastRead.number, name: lastRead.name } })}
                    >
                        <LinearGradient
                            colors={[theme.primary, theme.secondary]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.bannerGrad}
                        >
                            <View style={styles.bannerIconBox}>
                                <Ionicons name="book" size={24} color="#fff" />
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 14 }}>
                                <Text style={styles.bannerSub}>متابعة القراءة</Text>
                                <Text style={styles.bannerTitle} numberOfLines={1}>{lastRead.name}</Text>
                            </View>
                            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* ── SECTION TITLE ── */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>الخدمات الرئيسية</Text>

                {/* ── FEATURES ── */}
                {FEATURES.map(item => (
                    <TouchableOpacity
                        key={item.tab}
                        style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() => navigation.navigate(item.tab)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.featureIcon, { backgroundColor: item.color + '18' }]}>
                            <Ionicons name={item.icon} size={24} color={item.color} />
                        </View>
                        <View style={styles.featureMeta}>
                            <Text style={[styles.featureName, { color: theme.text }]}>{item.name}</Text>
                            <Text style={[styles.featureDesc, { color: theme.textDim }]}>{item.desc}</Text>
                        </View>
                        <View style={[styles.featureArrow, { backgroundColor: theme.primary + '12' }]}>
                            <Ionicons name="chevron-back" size={16} color={theme.primary} />
                        </View>
                    </TouchableOpacity>
                ))}

                {/* ── LINKS ── */}
                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 10 }]}>عن المبرمج والاكاديميه</Text>
                {LINKS.map(link => (
                    <TouchableOpacity
                        key={link.url}
                        style={[styles.linkCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() => Linking.openURL(link.url).catch(() => Alert.alert('خطأ', 'تعذر فتح الرابط'))}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.linkIcon, { backgroundColor: link.color + '20' }]}>
                            <Ionicons name={link.icon} size={18} color={link.color} />
                        </View>
                        <Text style={[styles.linkName, { color: theme.text }]}> <Text style={{ color: theme.primary }}>{link.lable}</Text> {link.name}</Text>
                        <Ionicons name="open-outline" size={16} color={theme.primary} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* ── THEME MODAL ── */}
            <Modal visible={showThemeModal} transparent animationType="slide" onRequestClose={() => setShowThemeModal(false)}>
                <View style={styles.overlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowThemeModal(false)} />
                    <View style={[styles.sheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + 20 }]}>
                        <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
                        <Text style={[styles.sheetTitle, { color: theme.text }]}>تخصيص المظهر</Text>
                        {Object.keys(themes).map(k => (
                            <TouchableOpacity
                                key={k}
                                style={[styles.themePill, { borderColor: k === theme.name ? theme.primary : theme.border }]}
                                onPress={() => { toggleTheme(k); setShowThemeModal(false); }}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.themeColor, { backgroundColor: themes[k].primary }]} />
                                <Text style={[styles.themeLabel, { color: theme.text }]}>{k}</Text>
                                {k === theme.name && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 20 },
    topBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    bismillah: { fontFamily: 'Amiri-Regular', fontSize: 18 },
    iconBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    salat: { fontFamily: 'Amiri-Bold', fontSize: 28, textAlign: 'right', marginBottom: 22 },
    widgetsRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 20 },
    widget: { flex: 1, padding: 14, borderRadius: 22, borderWidth: 1, minHeight: 90 },
    widgetIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8, alignSelf: 'flex-end' },
    widgetLabel: { fontSize: 10, fontWeight: '700', textAlign: 'right', marginBottom: 4 },
    widgetValue: { fontSize: 13, fontFamily: 'Amiri-Bold', textAlign: 'right' },
    banner: { borderRadius: 24, marginBottom: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
    bannerGrad: { padding: 18, flexDirection: 'row-reverse', alignItems: 'center' },
    bannerIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    bannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: 'Amiri-Regular', textAlign: 'right' },
    bannerTitle: { color: '#fff', fontSize: 20, fontFamily: 'Amiri-Bold', textAlign: 'right' },
    sectionTitle: { fontFamily: 'Amiri-Bold', fontSize: 20, textAlign: 'right', marginBottom: 14 },
    featureCard: { flexDirection: 'row-reverse', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
    featureIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    featureMeta: { flex: 1, marginHorizontal: 14 },
    featureName: { fontFamily: 'Amiri-Bold', fontSize: 16, textAlign: 'right' },
    featureDesc: { fontSize: 12, textAlign: 'right', marginTop: 3, fontFamily: 'Amiri-Regular' },
    featureArrow: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    linkCard: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
    linkIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 14 },
    linkName: { flex: 1, fontFamily: 'Amiri-Bold', fontSize: 14, textAlign: 'right' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24 },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
    sheetTitle: { fontFamily: 'Amiri-Bold', fontSize: 20, textAlign: 'right', marginBottom: 16 },
    themePill: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 2, marginBottom: 10 },
    themeColor: { width: 26, height: 26, borderRadius: 13, marginLeft: 14 },
    themeLabel: { flex: 1, fontFamily: 'Amiri-Bold', fontSize: 15, textAlign: 'right' },
});
