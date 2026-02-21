import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator,
    TouchableOpacity, Modal, Switch, StatusBar, Alert,
    Dimensions, PanResponder, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Brightness from 'expo-brightness';
import { useKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../context/ThemeContext';
import { useAppSettings, FONT_SCALE } from '../context/AppSettingsContext';
import { offlineData } from '../utils/offlineData';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');
const SPEEDS = [1, 2, 3, 5];
const SCROLL_SAVE_KEY = (n) => `surah_scroll_${n}`;

// ── Continuous Quran Text (all ayahs as one flowing paragraph) ────────
const ContinuousQuranText = memo(({ ayahs, theme, fontSizeScale, surahNumber, isJuz, highlightedVerse }) => {
    let lastSurah = null;

    return (
        <View style={[styles.quranPage, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.quranFlow, {
                color: theme.text,
                fontSize: 26 * fontSizeScale,
                lineHeight: 60 * fontSizeScale
            }]}>
                {ayahs.map((ayah, index) => {
                    const currentSurah = ayah.surah?.number || surahNumber;
                    const showBasmalah = currentSurah !== lastSurah && currentSurah !== 9;
                    lastSurah = currentSurah;

                    const isHigh = highlightedVerse === ayah.number;

                    return (
                        <Text
                            key={ayah.number ?? index}
                            style={[
                                isHigh && {
                                    backgroundColor: theme.primary,
                                    color: '#000', // Black text on emerald for high contrast
                                    fontWeight: 'bold',
                                    borderRadius: 8,
                                    paddingHorizontal: 4
                                }
                            ]}
                        >
                            {showBasmalah && (
                                <Text style={[styles.basmalahInline, { color: theme.primary }]}>
                                    {index === 0 ? '' : '\n\n'}
                                    {'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ  \n\n'}
                                </Text>
                            )}
                            <Text>{ayah.text}</Text>
                            <Text style={{ color: theme.primary, fontSize: 18 }}>
                                {'  ﴿'}{ayah.numberInSurah}{'﴾  '}
                            </Text>
                        </Text>
                    );
                })}
            </Text>
        </View>
    );
});


// ── Brightness Slider ───────────────────────────────────────────────────────
// Vertical bar \u2014 drag UP = brighter, drag DOWN = darker
const BrightnessBar = ({ brightness, onChange, color }) => {
    const barH = SCREEN_H * 0.35;
    const fillH = barH * brightness; // brightness 0.05\u20191.0
    const startRef = useRef(brightness);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => { startRef.current = brightness; },
            onPanResponderMove: (_, gesture) => {
                const delta = -gesture.dy / barH;
                const newVal = Math.min(1, Math.max(0.05, startRef.current + delta));
                onChange(newVal);
            },
        })
    ).current;

    return (
        <View style={[styles.brightnessBarWrap, { height: barH }]} {...panResponder.panHandlers}>
            <View style={[styles.brightTrack, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                <View style={[styles.brightFill, { height: fillH, backgroundColor: color }]} />
            </View>
        </View>
    );
};



// ── Main ──────────────────────────────────────────────────────────────
export default function SurahReaderScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { settings } = useAppSettings();
    const insets = useSafeAreaInsets();
    const { surahNumber, juzNumber, name, autoRestore } = route.params;

    const isJuz = !!juzNumber;
    const modeKey = isJuz ? `juz_${juzNumber}` : `surah_${surahNumber}`;

    // ── Keep Screen On ──
    if (settings.keepScreenOn) {
        useKeepAwake();
    }

    // ── State ─────────────────────────────────────────────────────────
    const [ayahs, setAyahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(2);
    const [brightness, setBrightnessState] = useState(0.8); // 0.05 → 1.0
    const [showBrightBar, setShowBrightBar] = useState(false);
    const [showToolbar, setShowToolbar] = useState(true);
    const [highlightedVerse, setHighlightedVerse] = useState(null);
    const toolbarAnim = useRef(new Animated.Value(1)).current;
    const systemBrightnessRef = useRef(null); // to restore on unmount

    // ── Refs ──────────────────────────────────────────────────────────
    const listRef = useRef(null);
    const scrollY = useRef(0);
    const contentH = useRef(0);
    const visibleH = useRef(SCREEN_H);
    const timerRef = useRef(null);
    const saveTimerRef = useRef(null);
    const restoredRef = useRef(false);

    // ── Brightness: save system level, apply ours, restore on leave ──────────────
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Save current system brightness to restore later
                const current = await Brightness.getBrightnessAsync();
                systemBrightnessRef.current = current;
                // Apply our initial brightness
                await Brightness.setBrightnessAsync(brightness);
            } catch (_) { }
        })();
        return () => {
            mounted = false;
            // Restore system brightness when leaving the screen
            if (systemBrightnessRef.current !== null) {
                Brightness.setBrightnessAsync(systemBrightnessRef.current).catch(() => { });
            }
        };
    }, []);

    // Apply brightness in real-time when slider changes
    const handleBrightnessChange = useCallback(async (val) => {
        const clamped = Math.min(1, Math.max(0.05, val));
        setBrightnessState(clamped);
        try { await Brightness.setBrightnessAsync(clamped); } catch (_) { }
    }, []);

    // ── Load Data ────────────────────────────────────────────────────
    useEffect(() => {
        let alive = true;
        const load = async () => {
            setLoading(true);
            setError(false);
            try {
                // If Surah, check completion
                if (!isJuz) {
                    const khatmah = await AsyncStorage.getItem('khatmah_progress');
                    if (khatmah && JSON.parse(khatmah)[surahNumber] && alive) setIsCompleted(true);
                }

                let data = isJuz
                    ? await offlineData.getJuz(juzNumber)
                    : await offlineData.getSurah(surahNumber);

                if (!data) {
                    const url = isJuz
                        ? `https://api.alquran.cloud/v1/juz/${juzNumber}/quran-uthmani`
                        : `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`;

                    const res = await axios.get(url, { timeout: 15000 });
                    data = res.data.data.ayahs;

                    if (isJuz) await offlineData.saveJuz(juzNumber, data);
                    else await offlineData.saveSurah(surahNumber, data);
                }

                if (!alive) return;
                setAyahs(data || []);
                setLoading(false);

                // Save last_read
                await AsyncStorage.setItem('last_read', JSON.stringify({
                    number: isJuz ? null : surahNumber,
                    juz: isJuz ? juzNumber : null,
                    name: name,
                    time: Date.now(),
                    mode: isJuz ? 'juz' : 'surah',
                    verse: 1
                }));
            } catch (e) {
                console.error('Reader error:', e);
                if (alive) { setError(true); setLoading(false); }
            }
        };
        load();
        return () => {
            alive = false;
            clearInterval(timerRef.current);
            clearTimeout(saveTimerRef.current);
        };
    }, [surahNumber, juzNumber]);

    // ── Restore scroll position after data loads ──────────────────────
    useEffect(() => {
        if (ayahs.length === 0 || restoredRef.current) return;
        const restoreScroll = async () => {
            try {
                const saved = await AsyncStorage.getItem(SCROLL_SAVE_KEY(modeKey));
                if (saved) {
                    const offset = parseFloat(saved);
                    if (offset > 10) {
                        if (autoRestore) {
                            // Direct restore if coming from the main resume prompt
                            const savedLR = await AsyncStorage.getItem('last_read');
                            if (savedLR) {
                                const lr = JSON.parse(savedLR);
                                if (lr.verse_abs) setHighlightedVerse(lr.verse_abs);
                            }

                            setTimeout(() => {
                                listRef.current?.scrollTo({ y: offset, animated: true });
                                // Keep highlight for 10 seconds so they don't miss it
                                setTimeout(() => setHighlightedVerse(null), 10000);
                            }, 800);
                        } else {
                            // Ask user if they just clicked the surah normally
                            Alert.alert(
                                'متابعة القراءة',
                                'هل تريد العودة إلى آخر مكان توقفت فيه؟',
                                [
                                    { text: 'لا', style: 'cancel' },
                                    {
                                        text: 'نعم', onPress: async () => {
                                            const savedLR = await AsyncStorage.getItem('last_read');
                                            if (savedLR) {
                                                const lr = JSON.parse(savedLR);
                                                if (lr.verse_abs) setHighlightedVerse(lr.verse_abs);
                                            }

                                            setTimeout(() => {
                                                listRef.current?.scrollTo({ y: offset, animated: true });
                                                setTimeout(() => setHighlightedVerse(null), 10000);
                                            }, 600);
                                        }
                                    },
                                ]
                            );
                        }
                    }
                }
            } catch (_) { }
            restoredRef.current = true;
        };
        restoreScroll();
    }, [ayahs, surahNumber]);

    // ── Auto-scroll engine ────────────────────────────────────────────
    useEffect(() => {
        clearInterval(timerRef.current);
        if (isAutoScrolling) {
            timerRef.current = setInterval(() => {
                const max = contentH.current - visibleH.current;
                if (max <= 0 || scrollY.current >= max) {
                    setIsAutoScrolling(false);
                    return;
                }
                const next = Math.min(scrollY.current + scrollSpeed, max);
                listRef.current?.scrollTo({ y: next, animated: false });
                scrollY.current = next;
            }, 50);
        }
        return () => clearInterval(timerRef.current);
    }, [isAutoScrolling, scrollSpeed]);

    // ── Save scroll position (debounced) ─────────────────────────────
    const handleScroll = useCallback((e) => {
        const y = e.nativeEvent.contentOffset.y;
        scrollY.current = y;
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            // Estimate visible verse (approximate centering)
            let verseNumAbs = 1;
            if (ayahs.length > 0 && contentH.current > 0) {
                // Adjust for viewport offset (top 1/4 of screen)
                const targetY = y + 150;
                const ratio = Math.min(1, Math.max(0, targetY / contentH.current));
                const idx = Math.floor(ratio * ayahs.length);
                verseNumAbs = ayahs[Math.min(ayahs.length - 1, idx)]?.number || 1;
            }

            const currentLR = await AsyncStorage.getItem('last_read');
            const lr = currentLR ? JSON.parse(currentLR) : {};

            AsyncStorage.setItem(SCROLL_SAVE_KEY(modeKey), y.toString()).catch(() => { });
            AsyncStorage.setItem('last_read', JSON.stringify({
                ...lr,
                verse_abs: verseNumAbs,
                time: Date.now()
            })).catch(() => { });
        }, 800);
    }, [modeKey, ayahs]);

    // ── Toolbar toggle (tap center of screen) ────────────────────────
    const toggleToolbar = useCallback(() => {
        const newVal = showToolbar ? 0 : 1;
        Animated.timing(toolbarAnim, { toValue: newVal, duration: 200, useNativeDriver: true }).start();
        setShowToolbar(v => !v);
    }, [showToolbar, toolbarAnim]);

    // ── Mark Complete ─────────────────────────────────────────────────
    const markComplete = useCallback(async () => {
        if (isCompleted || isJuz) return;
        try {
            const raw = await AsyncStorage.getItem('khatmah_progress');
            const data = raw ? JSON.parse(raw) : {};
            data[surahNumber] = true;
            await AsyncStorage.setItem('khatmah_progress', JSON.stringify(data));
            setIsCompleted(true);
            Alert.alert('تقبل الله', `تم تسجيل سورة ${name} في الختمة ✓`);
        } catch (_) { }
    }, [isCompleted, surahNumber, name, isJuz]);


    // ── Loading / Error ───────────────────────────────────────────────
    if (loading) return (
        <View style={[styles.fullCenter, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.centerTxt, { color: theme.primary }]}>
                جاري تحميل {isJuz ? `الجزء ${juzNumber}` : `سورة ${name}`}...
            </Text>
        </View>
    );

    if (error) return (
        <View style={[styles.fullCenter, { backgroundColor: theme.background }]}>
            <Ionicons name="cloud-offline-outline" size={64} color={theme.textDim} />
            <Text style={[styles.centerTxt, { color: theme.textDim }]}>تعذر تحميل السورة</Text>
            <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: theme.primary }]}
                onPress={() => { setError(false); setLoading(true); restoredRef.current = false; }}
            >
                <Text style={styles.retryTxt}>إعادة المحاولة</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />

            {/* NO overlay — brightness is controlled via expo-brightness directly */}

            {/* ── MAIN SCROLLVIEW (all ayahs as one flowing text) ── */}
            <ScrollView
                ref={listRef}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={50}
                onScroll={handleScroll}
                onContentSizeChange={(_, h) => { contentH.current = h; }}
                onLayout={(e) => { visibleH.current = e.nativeEvent.layout.height; }}
                contentContainerStyle={{ paddingBottom: 110 }}
            >
                {/* ── GRADIENT HEADER ── */}
                <LinearGradient
                    colors={[theme.primary, theme.secondary]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[styles.grad, { paddingTop: insets.top + 14 }]}
                >
                    <View style={styles.gradTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <Ionicons name="arrow-forward" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.headerBtn}>
                            <Ionicons name="settings-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.gradBadge}>{isJuz ? `رقم الجزء` : `رقم السورة`}</Text>
                    <Text style={styles.gradTitle}>{isJuz ? `الجزء ${juzNumber}` : name}</Text>
                    <View style={styles.gradMetaRow}>
                        <Text style={styles.gradMeta}>{ayahs.length} آية</Text>
                        <View style={styles.metaDot} />
                        <Text style={styles.gradMeta}>{isJuz ? 'أجزاء متصلة' : 'رسم عثماني'}</Text>
                    </View>
                    {!isJuz && (
                        <TouchableOpacity
                            onPress={markComplete}
                            activeOpacity={isCompleted ? 1 : 0.8}
                            style={[styles.markBtn, { backgroundColor: isCompleted ? '#22c55e' : 'rgba(255,255,255,0.22)' }]}
                        >
                            <Ionicons name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'} size={18} color="#fff" />
                            <Text style={styles.markBtnTxt}>{isCompleted ? 'مكتملة ✓' : 'حدد كمكتملة'}</Text>
                        </TouchableOpacity>
                    )}
                </LinearGradient>

                {/* ── ALL AYAHS AS CONTINUOUS FLOWING TEXT ── */}
                <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
                    <ContinuousQuranText
                        ayahs={ayahs}
                        theme={theme}
                        fontSizeScale={FONT_SCALE[settings.fontSize]}
                        surahNumber={surahNumber}
                        isJuz={isJuz}
                        highlightedVerse={highlightedVerse}
                    />
                </View>
            </ScrollView>

            {/* ── FLOATING TOOLBAR ── */}
            <Animated.View
                style={[
                    styles.toolbar,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        bottom: insets.bottom + 12,
                        opacity: toolbarAnim,
                        transform: [{ translateY: toolbarAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }],
                    }
                ]}
            >
                {/* Auto-scroll toggle */}
                <TouchableOpacity
                    onPress={() => setIsAutoScrolling(v => !v)}
                    style={[styles.toolBtn, isAutoScrolling && { backgroundColor: theme.primary }]}
                >
                    <Ionicons
                        name={isAutoScrolling ? 'pause-circle' : 'play-circle-outline'}
                        size={22}
                        color={isAutoScrolling ? '#fff' : theme.primary}
                    />
                </TouchableOpacity>

                {/* Speed selector (only when auto-scrolling) */}
                {isAutoScrolling && SPEEDS.map(s => (
                    <TouchableOpacity
                        key={s}
                        onPress={() => setScrollSpeed(s)}
                        style={[styles.speedBtn, scrollSpeed === s && { backgroundColor: theme.primary }]}
                    >
                        <Text style={{ color: scrollSpeed === s ? '#fff' : theme.primary, fontSize: 11, fontWeight: '900' }}>{s}x</Text>
                    </TouchableOpacity>
                ))}

                <View style={[styles.toolSep, { backgroundColor: theme.border }]} />

                {/* Brightness toggle */}
                <TouchableOpacity
                    onPress={() => setShowBrightBar(v => !v)}
                    style={[styles.toolBtn, showBrightBar && { backgroundColor: theme.primary + '30' }]}
                >
                    <Ionicons
                        name="sunny-outline"
                        size={20}
                        color={showBrightBar ? theme.primary : theme.textDim}
                    />
                </TouchableOpacity>

                {/* Quick brightness step buttons */}
                {showBrightBar && (
                    <>
                        <TouchableOpacity
                            onPress={() => handleBrightnessChange(brightness - 0.1)}
                            style={styles.toolBtn}
                        >
                            <Ionicons name="remove" size={20} color={theme.primary} />
                        </TouchableOpacity>
                        <View style={[styles.dimPill, { backgroundColor: theme.primary + '15' }]}>
                            <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '900' }}>
                                {Math.round(brightness * 100)}%
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleBrightnessChange(brightness + 0.1)}
                            style={styles.toolBtn}
                        >
                            <Ionicons name="add" size={20} color={theme.primary} />
                        </TouchableOpacity>
                    </>
                )}

                <View style={[styles.toolSep, { backgroundColor: theme.border }]} />

                {/* Show/hide toolbar */}
                <TouchableOpacity onPress={toggleToolbar} style={styles.toolBtn}>
                    <Ionicons name="eye-outline" size={20} color={theme.textDim} />
                </TouchableOpacity>
            </Animated.View>

            {/* ── BRIGHTNESS SIDE SLIDER ── */}
            {showBrightBar && (
                <View style={[styles.brightSidePanel, { bottom: insets.bottom + 100, backgroundColor: 'rgba(0,0,0,0.78)' }]}>
                    <Ionicons name="sunny" size={18} color="rgba(255,255,255,0.9)" style={{ marginBottom: 10 }} />
                    <BrightnessBar
                        brightness={brightness}
                        onChange={handleBrightnessChange}
                        color={theme.primary}
                    />
                    <Ionicons name="moon" size={16} color="rgba(255,255,255,0.7)" style={{ marginTop: 10 }} />
                    <View style={[styles.brightBadge, { backgroundColor: theme.primary + '25' }]}>
                        <Text style={[styles.brightPercent, { color: theme.primary }]}>
                            {Math.round(brightness * 100)}%
                        </Text>
                    </View>
                </View>
            )}

            {/* ── TAP TO SHOW TOOLBAR (when hidden) ── */}
            {!showToolbar && (
                <TouchableOpacity
                    style={styles.fullTap}
                    onPress={toggleToolbar}
                    activeOpacity={1}
                />
            )}

            {/* ── SETTINGS MODAL ── */}
            <Modal visible={showSettings} transparent animationType="slide" onRequestClose={() => setShowSettings(false)}>
                <View style={styles.overlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowSettings(false)} />
                    <View style={[styles.sheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + 20 }]}>
                        <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
                        <Text style={[styles.sheetTitle, { color: theme.text }]}>إعدادات القراءة</Text>

                        {/* Auto-scroll */}
                        <View style={styles.settingRow}>
                            <Text style={[styles.settingLbl, { color: theme.text }]}>التمرير التلقائي</Text>
                            <Switch
                                value={isAutoScrolling}
                                onValueChange={setIsAutoScrolling}
                                trackColor={{ false: theme.border, true: theme.primary }}
                                thumbColor="#fff"
                            />
                        </View>

                        {/* Speed */}
                        <Text style={[styles.settingLbl, { color: theme.text, marginBottom: 12 }]}>سرعة التمرير</Text>
                        <View style={styles.speedRow}>
                            {SPEEDS.map(s => (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => setScrollSpeed(s)}
                                    style={[styles.speedPill, {
                                        borderColor: theme.primary,
                                        backgroundColor: scrollSpeed === s ? theme.primary : 'transparent',
                                    }]}
                                >
                                    <Text style={{ color: scrollSpeed === s ? '#fff' : theme.primary, fontWeight: '900' }}>{s}x</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    fullCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    centerTxt: { marginTop: 14, fontFamily: 'Amiri-Bold', fontSize: 17, textAlign: 'center' },
    retryBtn: { marginTop: 20, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 20 },
    retryTxt: { color: '#fff', fontFamily: 'Amiri-Bold', fontSize: 15 },
    fullTap: { ...StyleSheet.absoluteFillObject, zIndex: 2 },

    // List
    listContent: { paddingHorizontal: 18, flexGrow: 1 },

    // Gradient header
    grad: {
        paddingHorizontal: 24, paddingBottom: 28,
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
        alignItems: 'center',
        marginHorizontal: -18, marginBottom: 0,
    },
    gradTop: { width: '100%', flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 10 },
    headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    gradBadgeRow: { marginBottom: 6 },
    gradBadge: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Amiri-Regular' },
    gradTitle: { color: '#fff', fontSize: 44, fontFamily: 'Amiri-Bold', marginBottom: 6 },
    gradMetaRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 18 },
    gradMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: 'Amiri-Regular' },
    metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 10 },
    markBtn: {
        flexDirection: 'row-reverse', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
    },
    markBtnTxt: { color: '#fff', fontFamily: 'Amiri-Bold', fontSize: 14, marginLeft: 8 },

    basmalah: {
        fontSize: 24, fontFamily: 'Amiri-Regular',
        textAlign: 'center', marginVertical: 20,
        writingDirection: 'rtl',
    },

    // Continuous Quran text
    quranPage: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    quranFlow: {
        fontSize: 26,
        fontFamily: 'Amiri-Regular',
        textAlign: 'right',
        lineHeight: 60,
        writingDirection: 'rtl',
    },
    basmalahInline: {
        fontSize: 22,
        fontFamily: 'Amiri-Bold',
        writingDirection: 'rtl',
    },

    // Floating toolbar
    toolbar: {
        position: 'absolute',
        left: 18, right: 18,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        gap: 6,
        zIndex: 10,
    },
    toolBtn: { width: 38, height: 38, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
    toolSep: { width: 1, height: 24, marginHorizontal: 4 },
    speedBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, minWidth: 36, alignItems: 'center' },
    dimPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, minWidth: 46, alignItems: 'center' },

    brightSidePanel: {
        position: 'absolute',
        right: 20,
        paddingVertical: 18,
        paddingHorizontal: 14,
        borderRadius: 28,
        alignItems: 'center',
        zIndex: 15,
        elevation: 25,
        gap: 4,
    },
    brightBadge: {
        marginTop: 10, borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    brightPercent: { fontSize: 13, fontWeight: '900' },

    // Brightness Bar
    brightnessBarWrap: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brightTrack: {
        width: 6,
        flex: 1,
        borderRadius: 3,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    brightFill: {
        width: '100%',
        borderRadius: 3,
    },

    // Settings modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24 },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
    sheetTitle: { fontFamily: 'Amiri-Bold', fontSize: 20, textAlign: 'right', marginBottom: 20 },
    settingRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    settingLbl: { fontFamily: 'Amiri-Bold', fontSize: 16 },
    speedRow: { flexDirection: 'row-reverse', gap: 10 },
    speedPill: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 16, borderWidth: 2 },
});
