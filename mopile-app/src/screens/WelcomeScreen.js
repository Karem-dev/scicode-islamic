import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Animated, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { offlineData } from '../utils/offlineData';

const { width, height } = Dimensions.get('window');

const T = {
    welcome: 'مرحباً بك في تطبيق  scicode islamic',
    description: 'تجربة رقمية فريدة للقرآن الكريم، الأذكار، ومواقيت الصلاة، بتصميم عصري وأداء متميز.',
    company: 'Developed by SciCode Academy',
    downloading: 'جاري تحميل البيانات للعمل بدون إنترنت...',
    start: 'ابدأ الرحلة الآن',
};

const services = [
    { icon: 'book', text: 'القرآن الكريم', desc: 'تلاوة وحفظ وتدبر' },
    { icon: 'heart', text: 'أذكار المسلم', desc: 'حصن النفس اليومي' },
    { icon: 'time', text: 'مواقيت دقيقة', desc: 'حسب موقعك الجغرافي' },
    { icon: 'map', text: 'مواقع المساجد', desc: 'الأقرب إليك دائماً' },
];

export default function WelcomeScreen({ onComplete }) {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleStart = async () => {
        setLoading(true);
        setProgress('جاري مزامنة المصحف الشريف...');
        await offlineData.preloadQuran();

        setProgress('جاري تجهيز حصن المسلم...');
        await offlineData.preloadAzkar();

        await AsyncStorage.setItem('has_onboarded', 'true');
        setLoading(false);
        onComplete();
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#061a12', '#020a07']} style={StyleSheet.absoluteFill} />

            <View style={[styles.meshShape, { top: -100, right: -100, backgroundColor: '#10b98115', width: 400, height: 400 }]} />
            <View style={[styles.meshShape, { bottom: -150, left: -150, backgroundColor: '#10b98110', width: 500, height: 500 }]} />

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
                <View style={styles.heroSection}>
                    <View style={styles.logoBox}>
                        <LinearGradient colors={['#10b981', '#059669']} style={styles.logoGrad}>
                            <Ionicons name="moon" size={50} color="#fff" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>{T.welcome}</Text>
                    <Text style={styles.description}>{T.description}</Text>
                </View>

                <View style={styles.servicesGrid}>
                    {services.map((item, idx) => (
                        <View key={idx} style={styles.serviceCard}>
                            <View style={styles.serviceIconWrap}>
                                <Ionicons name={item.icon} size={24} color="#10b981" />
                            </View>
                            <View style={styles.serviceMeta}>
                                <Text style={styles.serviceTitle}>{item.text}</Text>
                                <Text style={styles.serviceDesc}>{item.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={styles.companyText}>{T.company.toUpperCase()}</Text>
            </Animated.ScrollView>

            <View style={styles.footer}>
                <LinearGradient colors={['transparent', '#020a07']} style={styles.footerGrad} />
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#10b981" size="large" />
                        <Text style={styles.progressText}>{progress}</Text>
                    </View>
                ) : (
                    <TouchableOpacity activeOpacity={0.8} style={styles.mainBtn} onPress={handleStart}>
                        <LinearGradient colors={['#10b981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                            <Text style={styles.btnText}>{T.start}</Text>
                            <Ionicons name="arrow-back" size={22} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020a07' },
    meshShape: { position: 'absolute', borderRadius: 250, zIndex: 0 },
    scrollContent: { paddingTop: 100, paddingBottom: 180, paddingHorizontal: 30 },
    heroSection: { alignItems: 'center', marginBottom: 50 },
    logoBox: { width: 120, height: 120, borderRadius: 40, padding: 4, backgroundColor: 'rgba(16,185,129,0.1)', marginBottom: 30 },
    logoGrad: { flex: 1, borderRadius: 36, justifyContent: 'center', alignItems: 'center', elevation: 20 },
    title: { color: '#fff', fontSize: 32, fontFamily: 'Amiri-Bold', textAlign: 'center', lineHeight: 45 },
    description: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center', marginTop: 20, lineHeight: 28, paddingHorizontal: 10 },
    servicesGrid: { gap: 15 },
    serviceCard: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    serviceIconWrap: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 15 },
    serviceMeta: { flex: 1, alignItems: 'flex-end' },
    serviceTitle: { color: '#fff', fontSize: 18, fontFamily: 'Amiri-Bold' },
    serviceDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
    companyText: { color: '#10b981', fontSize: 10, fontWeight: '900', letterSpacing: 2, textAlign: 'center', marginTop: 60, opacity: 0.6 },
    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 30, paddingBottom: 50 },
    footerGrad: { position: 'absolute', top: -100, left: 0, right: 0, height: 100 },
    loadingContainer: { alignItems: 'center' },
    progressText: { color: '#10b981', marginTop: 15, fontSize: 13, fontFamily: 'Amiri-Bold' },
    mainBtn: { height: 75, borderRadius: 25, overflow: 'hidden', elevation: 15 },
    btnGrad: { flex: 1, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
    btnText: { color: '#fff', fontSize: 20, fontFamily: 'Amiri-Bold', marginRight: 15 },
});
