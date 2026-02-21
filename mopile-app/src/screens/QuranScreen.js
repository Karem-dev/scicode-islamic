import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, TextInput, StatusBar, Alert,
    Animated, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { offlineData } from '../utils/offlineData';
import { LIST_PADDING_BOTTOM } from '../constants/layout';

// ── Strip tashkeel + normalize for easy search ───────────────────────
const normalize = (str = '') =>
    str
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // harakat/tashkeel
        .replace(/[\u0622\u0623\u0625]/g, '\u0627')  // alef forms → ا
        .replace(/\u0629/g, '\u0647')               // ة → ه
        .toLowerCase().trim();

// ── Static data ───────────────────────────────────────────────────────
const JUZ_LIST = Array.from({ length: 30 }, (_, i) => ({
    number: i + 1,
    name: `الجزء ${i + 1}`,
    englishName: `Juz' ${i + 1}`,
    numberOfAyahs: null,
    revelationType: null,
}));

// ── Surah Card (memoized) ─────────────────────────────────────────────
const SurahCard = memo(({ item, theme, onPress, isSurah }) => (
    <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={[styles.numBox, { backgroundColor: theme.primary + '15' }]}>
            <View style={[styles.diamond, { borderColor: theme.primary + '50' }]} />
            <Text style={[styles.numText, { color: theme.primary }]}>{item.number}</Text>
        </View>
        <View style={styles.cardMeta}>
            <View style={styles.nameRow}>
                {item.isLastRead && (
                    <View style={[styles.lastReadBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.lastReadTxt}>آخر قراءة</Text>
                    </View>
                )}
                <Text style={[styles.cardName, { color: theme.text }]}>{item.name}</Text>
            </View>
            <Text style={[styles.cardSub, { color: theme.textDim }]}>
                {isSurah
                    ? `${item.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}  •  ${item.numberOfAyahs} آية`
                    : item.englishName}
            </Text>
        </View>
        <View style={[styles.arrow, { backgroundColor: theme.primary + '12' }]}>
            <Ionicons name="chevron-back" size={16} color={theme.primary} />
        </View>
    </TouchableOpacity>
));

export default function QuranScreen({ navigation }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const alertShownRef = useRef(false);

    const [surahs, setSurahs] = useState([]);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('surah');
    const [loading, setLoading] = useState(true);
    const [isFocused, setIsFocused] = useState(false);
    const [lastRead, setLastRead] = useState(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const modalAnim = useRef(new Animated.Value(0)).current;

    // Load surah list once
    useEffect(() => {
        let alive = true;
        (async () => {
            let data = await offlineData.getQuran();
            if (!data) data = await offlineData.preloadQuran();

            // Check last read
            const leer = await AsyncStorage.getItem('last_read');
            let lrObj = null;
            if (leer) {
                lrObj = JSON.parse(leer);
                setLastRead(lrObj);
            }

            if (!alive) return;
            setSurahs(data || []);
            setLoading(false);

            // Resume prompt
            if (lrObj && !alertShownRef.current) {
                alertShownRef.current = true;
                setTimeout(() => {
                    setShowResumeModal(true);
                    Animated.spring(modalAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }).start();
                }, 1000);
            }
        })();
        return () => { alive = false; };
    }, []);

    const filtered = useMemo(() => {
        const src = tab === 'surah' ? surahs : JUZ_LIST;
        const processed = src.map(s => ({
            ...s,
            isLastRead: lastRead && (tab === 'surah' ? s.number === lastRead.number : s.number === lastRead.juz)
        }));

        if (!search.trim()) return processed;
        const q = normalize(search);
        return processed.filter(s =>
            normalize(s.name || '').includes(q) ||
            normalize(s.englishName || '').includes(q) ||
            String(s.number) === search.trim()
        );
    }, [surahs, search, tab, lastRead]);

    const keyExtractor = useCallback((item) => `${tab}-${item.number}`, [tab]);

    const onPress = useCallback((item) => {
        if (tab === 'surah') {
            navigation.navigate('SurahReader', { surahNumber: item.number, name: item.name });
        } else {
            navigation.navigate('SurahReader', { juzNumber: item.number, name: item.name });
        }
        setShowResumeModal(false);
    }, [tab, navigation]);

    const renderItem = useCallback(({ item }) => (
        <SurahCard item={item} theme={theme} isSurah={tab === 'surah'} onPress={() => onPress(item)} />
    ), [theme, tab, onPress]);

    if (loading) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadTxt, { color: theme.primary }]}>جاري تحميل القرآن الكريم...</Text>
        </View>
    );

    const headerPaddingTop = insets.top + 30;

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />
            <FlatList
                data={filtered}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
                windowSize={10}
                initialNumToRender={15}
                maxToRenderPerBatch={20}
                contentContainerStyle={[styles.listContent, { paddingBottom: LIST_PADDING_BOTTOM }]}
                ListHeaderComponent={
                    <View style={styles.headerWrap}>
                        {/* Gradient header */}
                        <LinearGradient
                            colors={[theme.primary, theme.secondary]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={[styles.grad, { paddingTop: headerPaddingTop }]}
                        >
                            <Text style={styles.gradTitle}>القرآن الكريم</Text>
                            <Text style={styles.gradSub}>بسم الله الرحمٰن الرحيم</Text>

                            {/* Tab switcher */}
                            <View style={styles.tabs}>
                                {['juz', 'surah'].map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => { setTab(t); setSearch(''); }}
                                        style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.tabTxt, { color: tab === t ? theme.primary : '#fff' }]}>
                                            {t === 'surah' ? 'السور' : 'الأجزاء'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </LinearGradient>

                        {/* Floating search bar */}
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
                                placeholder={tab === 'surah' ? 'ابحث عن سورة...' : 'ابحث عن جزء...'}
                                placeholderTextColor={theme.textDim}
                                value={search}
                                onChangeText={setSearch}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                returnKeyType="search"
                                selectionColor={theme.primary}
                                autoCorrect={false}
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')}>
                                    <Ionicons name="close-circle" size={18} color={theme.textDim} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {search.length > 0 && (
                            <Text style={[styles.searchHint, { color: theme.textDim }]}>
                                وجدنا {filtered.length} {tab === 'surah' ? 'سورة' : 'جزء'}
                            </Text>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    search.length > 0 ? (
                        <View style={styles.emptyResults}>
                            <Ionicons name="search-outline" size={60} color={theme.border} />
                            <Text style={[styles.emptyTxt, { color: theme.textDim }]}>عذراً، لم نجد ما تبحث عنه</Text>
                            <TouchableOpacity
                                onPress={() => setSearch('')}
                                style={[styles.resetSearch, { backgroundColor: theme.primary }]}
                            >
                                <Text style={styles.resetSearchTxt}>عرض الكل</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />

            {/* Premium Resume Modal */}
            <Modal visible={showResumeModal} transparent animationType="none">
                <View style={styles.modalOverlay}>
                    <Animated.View style={[
                        styles.modalCard,
                        {
                            backgroundColor: theme.card,
                            opacity: modalAnim,
                            transform: [{
                                scale: modalAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1]
                                })
                            }]
                        }
                    ]}>
                        <View style={[styles.modalIcon, { backgroundColor: theme.primary + '15' }]}>
                            <Ionicons name="book" size={32} color={theme.primary} />
                        </View>
                        <Text style={[styles.mTitle, { color: theme.text }]}>متابعة القراءة</Text>
                        <Text style={[styles.mSub, { color: theme.textDim }]}>
                            هل تود العودة إلى آخر مكان توقفت فيه في {lastRead?.mode === 'juz' ? `الجزء ${lastRead?.juz}` : `سورة ${lastRead?.name}`}؟
                        </Text>
                        <View style={styles.mActions}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowResumeModal(false);
                                    navigation.navigate('SurahReader', lastRead?.mode === 'juz'
                                        ? { juzNumber: lastRead.juz, name: lastRead.name, autoRestore: true }
                                        : { surahNumber: lastRead.number, name: lastRead.name, autoRestore: true });
                                }}
                                style={[styles.mBtn, { backgroundColor: theme.primary }]}
                            >
                                <Text style={styles.mBtnTxt}>نعم، تابع</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowResumeModal(false)}
                                style={[styles.mBtnAlt, { borderColor: theme.border }]}
                            >
                                <Text style={[styles.mBtnAltTxt, { color: theme.textDim }]}>لاحقاً</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadTxt: { marginTop: 12, fontFamily: 'Amiri-Bold', fontSize: 15 },

    listContent: { paddingHorizontal: 18, flexGrow: 1 },

    // Header
    headerWrap: { marginHorizontal: -18, marginBottom: 18 },
    grad: {
        paddingHorizontal: 30,
        paddingBottom: 65,
        borderBottomLeftRadius: 48,
        borderBottomRightRadius: 48,
        alignItems: 'center',
    },
    gradTitle: { color: '#fff', fontSize: 36, fontFamily: 'Amiri-Bold', marginBottom: 6 },
    gradSub: { color: 'rgba(255,255,255,0.75)', fontFamily: 'Amiri-Regular', fontSize: 16, marginBottom: 24 },
    tabs: {
        flexDirection: 'row-reverse',
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 20,
        padding: 4,
        width: 220,
    },
    tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 16, alignItems: 'center' },
    tabBtnActive: { backgroundColor: '#fff' },
    tabTxt: { fontFamily: 'Amiri-Bold', fontSize: 14 },
    searchBar: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        borderRadius: 26,
        height: 58,
        marginHorizontal: 24,
        marginTop: -29,
        paddingHorizontal: 16,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        borderWidth: 1.5,
    },
    searchInput: { flex: 1, textAlign: 'right', fontFamily: 'Amiri-Regular', fontSize: 16, marginHorizontal: 10 },
    searchHint: { textAlign: 'right', paddingHorizontal: 30, fontSize: 12, fontFamily: 'Amiri-Regular', marginTop: 10 },
    emptyResults: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
    emptyTxt: { fontFamily: 'Amiri-Regular', fontSize: 16, marginTop: 12, textAlign: 'center' },
    resetSearch: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
    resetSearchTxt: { color: '#fff', fontFamily: 'Amiri-Bold', fontSize: 14 },

    // Card
    card: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 16,
        borderRadius: 28,
        borderWidth: 1,
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    numBox: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 14 },
    diamond: { position: 'absolute', width: 32, height: 32, borderWidth: 1.5, borderRadius: 7, transform: [{ rotate: '45deg' }] },
    numText: { fontSize: 16, fontWeight: '900' },
    cardMeta: { flex: 1 },
    nameRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start' },
    cardName: { fontSize: 20, fontFamily: 'Amiri-Bold', textAlign: 'right' },
    cardSub: { fontSize: 13, textAlign: 'right', marginTop: 4, fontFamily: 'Amiri-Regular' },
    lastReadBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
    lastReadTxt: { color: '#fff', fontSize: 10, fontFamily: 'Amiri-Bold' },
    arrow: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalCard: { width: '100%', borderRadius: 32, padding: 32, alignItems: 'center' },
    modalIcon: { width: 70, height: 70, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    mTitle: { fontSize: 22, fontFamily: 'Amiri-Bold', marginBottom: 12 },
    mSub: { fontSize: 16, fontFamily: 'Amiri-Regular', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
    mActions: { width: '100%', gap: 12 },
    mBtn: { width: '100%', paddingVertical: 15, borderRadius: 18, alignItems: 'center', elevation: 4 },
    mBtnTxt: { color: '#fff', fontFamily: 'Amiri-Bold', fontSize: 16 },
    mBtnAlt: { width: '100%', paddingVertical: 14, borderRadius: 18, alignItems: 'center', borderWidth: 1.5 },
    mBtnAltTxt: { fontFamily: 'Amiri-Bold', fontSize: 16 },
});
