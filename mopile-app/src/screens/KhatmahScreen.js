import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, ActivityIndicator,
    TextInput, StatusBar, Modal, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { offlineData } from '../utils/offlineData';
import { LIST_PADDING_BOTTOM } from '../constants/layout';

// ── Arabic string normalizer
const normalize = (str = '') =>
    str
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[\u0622\u0623\u0625\u0627]/g, '\u0627')
        .replace(/\u0629/g, '\u0647')
        .toLowerCase()
        .trim();

const STORAGE_KEY = 'khatmah_progress';

export default function KhatmahScreen() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const [completed, setCompleted] = useState({});
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // ── Modal state and animation
    const [showResetModal, setShowResetModal] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        if (showResetModal) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 100, useNativeDriver: true }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.85);
        }
    }, [showResetModal]);

    const completedRef = useRef(completed);
    useEffect(() => { completedRef.current = completed; }, [completed]);

    // ── Load data
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved && alive) {
                    const parsed = JSON.parse(saved);
                    setCompleted(parsed);
                    completedRef.current = parsed;
                }
            } catch (_) { }

            let s = await offlineData.getQuran();
            if (!s) s = await offlineData.preloadQuran();
            if (alive) {
                setSurahs(s || []);
                setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    // ── Filtered list
    const filtered = useMemo(() => {
        const q = normalize(search);
        if (!q) return surahs;
        return surahs.filter(s =>
            normalize(s.name || '').includes(q) ||
            normalize(s.englishName || '').includes(q.toLowerCase()) ||
            String(s.number) === q
        );
    }, [surahs, search]);

    // ── Toggle surah completion
    const toggleSurah = useCallback((num) => {
        setCompleted(prev => {
            const newState = { ...prev, [num]: !prev[num] };
            if (!newState[num]) delete newState[num];
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState)).catch(() => { });
            return newState;
        });
    }, []);

    // ── Reset logic
    const doReset = useCallback(() => {
        const empty = {};
        completedRef.current = empty;
        setCompleted(empty);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(empty)).catch(() => { });
        setShowResetModal(false);
    }, []);

    const handleReset = useCallback(() => {
        setShowResetModal(true);
    }, []);

    // ── Stats
    const completedCount = useMemo(
        () => Object.keys(completed).filter(k => completed[k] === true).length,
        [completed]
    );
    const total = 114;
    const percent = Math.round((completedCount / total) * 100);

    if (loading) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );

    // ── Render surah item
    const renderItem = ({ item }) => {
        const isDone = completed[item.number] === true;
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.card, {
                    backgroundColor: theme.card,
                    borderColor: isDone ? theme.primary : theme.border,
                }]}
                onPress={() => toggleSurah(item.number)}
            >
                <View style={[styles.checkBox, {
                    backgroundColor: isDone ? theme.primary : theme.primary + '12',
                    borderColor: isDone ? theme.primary : theme.border,
                }]}>
                    <Ionicons
                        name={isDone ? 'checkmark' : 'ellipse-outline'}
                        size={20}
                        color={isDone ? '#fff' : theme.primary}
                    />
                </View>

                <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.cardNum, { color: theme.textDim }]}>
                        {item.number}  •  {item.numberOfAyahs} آية
                    </Text>
                </View>

                {isDone && (
                    <View style={[styles.doneBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.doneTxt}>تمت ✓</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />

            {/* ── RESET MODAL ── */}
            <Modal
                visible={showResetModal}
                transparent
                animationType="none"
                onRequestClose={() => setShowResetModal(false)}
                statusBarTranslucent
            >
                <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                    <Animated.View style={[styles.modalCard, { backgroundColor: theme.card, transform: [{ scale: scaleAnim }] }]}>
                        <View style={[styles.modalIconWrap, { backgroundColor: theme.primary + '18' }]}>
                            <Ionicons name="refresh-circle-outline" size={44} color={theme.primary} />
                        </View>

                        <Text style={[styles.modalTitle, { color: theme.text }]}>إعادة الختمة</Text>

                        <Text style={[styles.modalSub, { color: theme.textDim }]}>
                            هل تريد إعادة البدء من أول الختمة؟{`\n`}سيتم إعادة ضبط جميع السور.
                        </Text>

                        <View style={styles.modalBtns}>
                            <TouchableOpacity
                                onPress={() => setShowResetModal(false)}
                                style={[styles.modalBtnCancel, { borderColor: theme.border }]}
                                activeOpacity={0.75}
                            >
                                <Text style={[styles.modalBtnCancelTxt, { color: theme.textDim }]}>إلغاء</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={doReset}
                                style={[styles.modalBtnConfirm, { backgroundColor: theme.primary }]}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.modalBtnConfirmTxt}>تأكيد</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* ── FLATLIST ── */}
            <FlatList
                data={filtered}
                keyExtractor={item => String(item.number)}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
                windowSize={10}
                initialNumToRender={20}
                contentContainerStyle={[styles.list, { paddingBottom: LIST_PADDING_BOTTOM }]}
                ListHeaderComponent={
                    <View>
                        <LinearGradient
                            colors={[theme.primary, theme.secondary]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={[styles.grad, { paddingTop: insets.top + 24 }]}
                        >
                            <Text style={styles.gradTitle}>تتبع الختمة</Text>

                            <View style={styles.progressRow}>
                                <View style={styles.circleOuter}>
                                    <View style={[styles.circleInner, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                        <Text style={styles.percentTxt}>{percent}%</Text>
                                        <Text style={styles.percentSub}>{completedCount}/{total}</Text>
                                    </View>
                                </View>

                                <View style={styles.statsCol}>
                                    <Text style={styles.statsLabel}>التقدم الحالي</Text>
                                    <Text style={styles.statsValue}>{total - completedCount} سورة متبقية</Text>

                                    <TouchableOpacity
                                        onPress={handleReset}
                                        style={styles.resetBtn}
                                        activeOpacity={0.75}
                                    >
                                        <Ionicons name="refresh" size={16} color="#fff" />
                                        <Text style={styles.resetTxt}>بدأ من جديد</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.progTrackInner}>
                                <View style={[styles.progFillInner, { width: `${percent}%` }]} />
                            </View>
                        </LinearGradient>

                        <View style={[
                            styles.searchBar,
                            {
                                backgroundColor: theme.card,
                                borderColor: isFocused ? theme.primary : theme.border,
                                borderWidth: isFocused ? 2.5 : 1.5,
                            }
                        ]}>
                            <Ionicons name="search" size={20} color={isFocused ? theme.primary : theme.textDim} />
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder="ابحث بأي كتابة... (بدون تشكيل)"
                                placeholderTextColor={theme.textDim}
                                value={search}
                                onChangeText={setSearch}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                returnKeyType="search"
                                selectionColor={theme.primary}
                                autoCorrect={false}
                                autoCapitalize="none"
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')}>
                                    <Ionicons name="close-circle" size={18} color={theme.textDim} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {search.length > 0 && (
                            <Text style={[styles.searchHint, { color: theme.textDim }]}>
                                وجدنا {filtered.length} نتيجة
                            </Text>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    search.length > 0 ? (
                        <View style={styles.emptyResults}>
                            <Ionicons name="search-outline" size={60} color={theme.border} />
                            <Text style={[styles.emptyTxt, { color: theme.textDim }]}>عذراً، لم نجد هذه السورة</Text>
                            <TouchableOpacity
                                onPress={() => setSearch('')}
                                style={[styles.resetSearch, { backgroundColor: theme.primary }]}
                            >
                                <Text style={styles.resetSearchTxt}>عرض كل السور</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingHorizontal: 18, flexGrow: 1 },

    grad: { paddingHorizontal: 24, paddingBottom: 55, borderBottomLeftRadius: 44, borderBottomRightRadius: 44, alignItems: 'center', marginHorizontal: -18 },
    gradTitle: { color: '#fff', fontSize: 28, fontFamily: 'Amiri-Bold', marginBottom: 20 },

    progressRow: { flexDirection: 'row-reverse', alignItems: 'center', width: '100%', paddingHorizontal: 10, marginBottom: 16 },
    circleOuter: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: 'rgba(255,255,255,0.35)', padding: 4 },
    circleInner: { flex: 1, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    percentTxt: { color: '#fff', fontSize: 26, fontWeight: '900' },
    percentSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', marginTop: 2 },

    statsCol: { flex: 1, alignItems: 'flex-end', marginLeft: 16 },
    statsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
    statsValue: { color: '#fff', fontSize: 22, fontFamily: 'Amiri-Bold', marginBottom: 14 },

    resetBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', gap: 8 },
    resetTxt: { color: '#fff', fontFamily: 'Amiri-Bold', fontSize: 14 },

    progTrackInner: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
    progFillInner: { height: 6, backgroundColor: '#fff', borderRadius: 3 },

    searchBar: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        borderRadius: 26,
        height: 58,
        marginHorizontal: 2,
        marginTop: -29,
        paddingHorizontal: 16,
        elevation: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 14,
        borderWidth: 1.5,
    },
    searchInput: { flex: 1, textAlign: 'right', fontFamily: 'Amiri-Regular', fontSize: 16, marginHorizontal: 10 },
    searchHint: { textAlign: 'right', fontSize: 12, fontFamily: 'Amiri-Regular', marginTop: 10, marginBottom: 4, marginRight: 6 },
    emptyResults: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
    emptyTxt: { fontFamily: 'Amiri-Regular', fontSize: 16, marginTop: 12, textAlign: 'center' },
    resetSearch: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
    resetSearchTxt: { color: '#fff', fontFamily: 'Amiri-Bold', fontSize: 14 },

    card: { flexDirection: 'row-reverse', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1.5, marginBottom: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
    checkBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 14, borderWidth: 1.5 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 18, fontFamily: 'Amiri-Bold', textAlign: 'right' },
    cardNum: { fontSize: 12, textAlign: 'right', marginTop: 3, fontFamily: 'Amiri-Regular' },
    doneBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
    doneTxt: { color: '#fff', fontSize: 11, fontWeight: '900' },

    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    modalCard: { width: '100%', borderRadius: 32, padding: 28, alignItems: 'center', elevation: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24 },
    modalIconWrap: { width: 80, height: 80, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
    modalTitle: { fontSize: 22, fontFamily: 'Amiri-Bold', textAlign: 'center', marginBottom: 10 },
    modalSub: { fontSize: 14, fontFamily: 'Amiri-Regular', textAlign: 'center', lineHeight: 24, marginBottom: 26 },
    modalBtns: { flexDirection: 'row-reverse', gap: 12, width: '100%' },
    modalBtnCancel: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
    modalBtnCancelTxt: { fontFamily: 'Amiri-Bold', fontSize: 15 },
    modalBtnConfirm: { flex: 1.4, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    modalBtnConfirmTxt: { color: '#fff', fontFamily: 'Amiri-Bold', fontSize: 16 },
});