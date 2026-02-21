import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const T = {
    title: 'مواقيت الصلاة',
    city: 'القاهرة، مصر',
    loading: 'جاري تحميل المواقيت...',
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    nextPrayer: 'الصلاة القادمة',
};

const prayerIcons = {
    Fajr: 'sunny-outline',
    Sunrise: 'partly-sunny-outline',
    Dhuhr: 'sunny',
    Asr: 'cloud-outline',
    Maghrib: 'moon-outline',
    Isha: 'moon',
};

export default function PrayerTimesScreen({ navigation }) {
    const { theme } = useTheme();
    const [times, setTimes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [nextPrayer, setNextPrayer] = useState(null);

    useEffect(() => {
        axios.get('https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5')
            .then(res => {
                const timings = res.data.data.timings;
                setTimes(timings);
                calculateNextPrayer(timings);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const calculateNextPrayer = (timings) => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const prayers = [
            { name: T.fajr, key: 'Fajr', icon: 'sunny-outline' },
            { name: T.dhuhr, key: 'Dhuhr', icon: 'sunny' },
            { name: T.asr, key: 'Asr', icon: 'cloud-outline' },
            { name: T.maghrib, key: 'Maghrib', icon: 'moon-outline' },
            { name: T.isha, key: 'Isha', icon: 'moon' },
        ];

        let found = false;
        for (let p of prayers) {
            const [h, m] = timings[p.key].split(':').map(Number);
            const pTime = h * 60 + m;
            if (pTime > currentTime) {
                setNextPrayer({ ...p, time: timings[p.key] });
                found = true;
                break;
            }
        }
        if (!found) {
            setNextPrayer({ ...prayers[0], time: timings.Fajr }); // Tomorrow's Fajr
        }
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.primary }]}>{T.loading}</Text>
            </View>
        );
    }

    const items = [
        { name: T.fajr, key: 'Fajr', time: times.Fajr, icon: 'sunny-outline' },
        { name: T.sunrise, key: 'Sunrise', time: times.Sunrise, icon: 'partly-sunny-outline' },
        { name: T.dhuhr, key: 'Dhuhr', time: times.Dhuhr, icon: 'sunny' },
        { name: T.asr, key: 'Asr', time: times.Asr, icon: 'cloud-outline' },
        { name: T.maghrib, key: 'Maghrib', time: times.Maghrib, icon: 'moon-outline' },
        { name: T.isha, key: 'Isha', time: times.Isha, icon: 'moon' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />

            {/* Premium Header */}
            <LinearGradient
                colors={[theme.primary, theme.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.topNav}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                        <Ionicons name="arrow-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{T.title}</Text>
                    <View style={{ width: 44 }} />
                </View>

                {nextPrayer && (
                    <View style={styles.nextPrayerCard}>
                        <Text style={styles.nextLabel}>{T.nextPrayer}</Text>
                        <Text style={styles.nextName}>{nextPrayer.name}</Text>
                        <Text style={styles.nextTime}>{nextPrayer.time}</Text>
                        <View style={styles.locationBadge}>
                            <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.locationText}>{T.city}</Text>
                        </View>
                    </View>
                )}
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.list}>
                    {items.map((item, idx) => {
                        const isNext = nextPrayer?.key === item.key;
                        return (
                            <View key={idx} style={[styles.card, { backgroundColor: theme.card, borderColor: isNext ? theme.primary : theme.border }]}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconBox, { backgroundColor: isNext ? theme.primary + '15' : theme.primary + '08' }]}>
                                        <Ionicons name={item.icon} size={22} color={isNext ? theme.primary : theme.textDim} />
                                    </View>
                                    <Text style={[styles.cardName, { color: theme.text }]}>{item.name}</Text>
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={[styles.cardTime, { color: isNext ? theme.primary : theme.text }]}>{item.time}</Text>
                                    {isNext && (
                                        <View style={[styles.activePill, { backgroundColor: theme.primary }]}>
                                            <Text style={styles.activeText}>القادمة</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={[styles.infoFooter, { backgroundColor: theme.primary + '05', borderColor: theme.primary + '20' }]}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
                    <Text style={[styles.footerText, { color: theme.textDim }]}>
                        الأوقات محسوبة حسب التوقيت المحلي لمدينة القاهرة وبالاعتماد على الهيئة العامة المصرية للمساحة.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, fontFamily: 'Amiri-Bold', fontSize: 16 },
    header: { paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, elevation: 15 },
    topNav: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 30 },
    iconCircle: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Amiri-Bold' },
    nextPrayerCard: { alignItems: 'center' },
    nextLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 5 },
    nextName: { color: '#fff', fontSize: 44, fontFamily: 'Amiri-Bold', lineHeight: 54 },
    nextTime: { color: '#fff', fontSize: 64, fontWeight: '200', marginVertical: 10 },
    locationBadge: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
    locationText: { color: '#fff', fontSize: 13, marginRight: 6, fontWeight: '600' },
    scrollContent: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 50 },
    list: { gap: 15 },
    card: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 30, borderWidth: 1, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row-reverse', alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 15 },
    cardName: { fontSize: 18, fontFamily: 'Amiri-Bold' },
    cardInfo: { flexDirection: 'column', alignItems: 'flex-start' },
    cardTime: { fontSize: 22, fontWeight: 'bold' },
    activePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
    activeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    infoFooter: { marginTop: 30, padding: 20, borderRadius: 25, borderWidth: 1, flexDirection: 'row-reverse', alignItems: 'center' },
    footerText: { flex: 1, marginRight: 15, fontSize: 13, lineHeight: 20, textAlign: 'right', fontFamily: 'Amiri-Regular' },
});
