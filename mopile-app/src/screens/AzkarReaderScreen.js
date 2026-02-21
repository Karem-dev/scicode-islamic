import React, { useState, useEffect, useRef, memo } from 'react';
import {
    View, Text, StyleSheet, FlatList, ScrollView,
    TouchableOpacity, StatusBar, Share, Modal, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppSettings, FONT_SCALE } from '../context/AppSettingsContext';
import { getAzkarMeta } from '../utils/azkarIcons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';

// ── Tasbeeh Counter ─────────────────────────────────────────────
const TasbeehCounter = memo(({ count, max, onPress, color }) => {
    const done = count >= max;
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={done ? 1 : 0.7}
            style={[styles.counterCircle, {
                borderColor: color,
                backgroundColor: done ? color : 'transparent',
            }]}
        >
            <Text style={[styles.counterNum, { color: done ? '#fff' : color }]}>
                {done ? '✓' : count}
            </Text>
            <Text style={[styles.counterMax, { color: done ? 'rgba(255,255,255,0.8)' : color }]}>
                / {max}
            </Text>
        </TouchableOpacity>
    );
});

// ── Main Screen ───────────────────────────────────────────────
export default function AzkarReaderScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { settings } = useAppSettings();
    const insets = useSafeAreaInsets();
    const { category } = route.params;

    // ── Keep Screen On ──
    if (settings.keepScreenOn) {
        useKeepAwake();
    }

    const azkar = category?.data || [];
    const title = category?.category || category?.name || 'الأذكار';
    const { icon } = getAzkarMeta(title);
    const colors = [theme.primary, theme.secondary]; // Use theme colors instead of category colors

    // ── State ───────────────────────────────────────────────
    const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'
    const [cardIndex, setCardIndex] = useState(0);
    const [counts, setCounts] = useState({});
    const [showResetModal, setShowResetModal] = useState(false);

    // Animation for reset modal
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

    // ── Derived ──────────────────────────────────────────────
    const currentZikr = azkar[cardIndex] || {};
    const maxCount = parseInt(currentZikr.count) || 1;
    const currentCount = counts[cardIndex] || 0;
    const isDone = currentCount >= maxCount;

    const allDone =
        azkar.length > 0 &&
        azkar.every((z, i) => (counts[i] || 0) >= (parseInt(z.count) || 1));

    // ── COUNTER ──────────────────────────────────────────────
    const handleCount = () => {
        const max = parseInt(azkar[cardIndex]?.count) || 1;
        const cur = counts[cardIndex] || 0;
        if (cur >= max) return;

        // 📳 Haptic feedback if enabled
        if (settings.hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
        }

        const nextCount = cur + 1;
        setCounts(prev => ({ ...prev, [cardIndex]: nextCount }));

        // ⏩ Auto-advance if enabled and this was the last count
        if (settings.autoAdvance && nextCount >= max) {
            if (cardIndex < azkar.length - 1) {
                setTimeout(() => setCardIndex(i => i + 1), 600);
            }
        }
    };

    // ── NAVIGATION ──────────────────────────────────────────
    const goNext = () => { if (cardIndex < azkar.length - 1) setCardIndex(i => i + 1); };
    const goPrev = () => { if (cardIndex > 0) setCardIndex(i => i - 1); };

    // ── SHARE ───────────────────────────────────────────────
    const handleShare = async () => {
        const text = currentZikr.content || currentZikr.zekr || '';
        if (!text) return;
        try { await Share.share({ message: `${text}\n\n${title}` }); } catch (_) { }
    };

    // ── RESET ───────────────────────────────────────────────
    const doReset = () => {
        setCardIndex(0);
        setCounts({});
        setShowResetModal(false);
    };
    const handleReset = () => setShowResetModal(true);

    // ── CARD MODE ───────────────────────────────────────────
    const renderCard = () => (
        <ScrollView
            style={styles.cardScroll}
            contentContainerStyle={styles.cardContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.cardIconBox, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name={icon} size={32} color={theme.primary} />
            </View>

            <Text style={[styles.zikrText, {
                color: theme.text,
                fontSize: 28 * FONT_SCALE[settings.fontSize],
                lineHeight: 54 * FONT_SCALE[settings.fontSize]
            }]}>
                {currentZikr.content || currentZikr.zekr}
            </Text>

            {(currentZikr.description || currentZikr.bless) && (
                <View style={[styles.fadlBox, { backgroundColor: theme.primary + '08' }]}>
                    <Text style={[styles.fadlText, { color: theme.textDim }]}>
                        {currentZikr.description || currentZikr.bless}
                    </Text>
                </View>
            )}

            {currentZikr.reference && (
                <Text style={[styles.refText, { color: theme.textDim }]}>{currentZikr.reference}</Text>
            )}

            <View style={styles.counterRow}>
                <TouchableOpacity
                    onPress={goPrev} disabled={cardIndex === 0}
                    style={[styles.sideBtn, {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        opacity: cardIndex === 0 ? 0.3 : 1,
                    }]}
                >
                    <Ionicons name="chevron-forward" size={22} color={theme.primary} />
                </TouchableOpacity>

                <TasbeehCounter
                    count={currentCount}
                    max={maxCount}
                    onPress={handleCount}
                    color={theme.primary}
                />

                <TouchableOpacity
                    onPress={goNext} disabled={cardIndex >= azkar.length - 1}
                    style={[styles.sideBtn, {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        opacity: cardIndex >= azkar.length - 1 ? 0.3 : 1,
                    }]}
                >
                    <Ionicons name="chevron-back" size={22} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {isDone && cardIndex < azkar.length - 1 && (
                <TouchableOpacity
                    onPress={goNext}
                    style={[styles.nextBtn, { backgroundColor: theme.primary }]}
                    activeOpacity={0.85}
                >
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                    <Text style={styles.nextBtnTxt}>الذكر التالي</Text>
                </TouchableOpacity>
            )}

            {allDone && (
                <View style={[styles.allDoneBox, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="checkmark-done-circle" size={28} color={theme.primary} />
                    <Text style={[styles.allDoneTxt, { color: theme.primary }]}>
                        أتممت جميع الأذكار بنجاح
                    </Text>
                </View>
            )}
        </ScrollView>
    );

    // ── LIST MODE ───────────────────────────────────────────
    const renderListItem = ({ item, index }) => {
        const max = parseInt(item.count) || 1;
        const cur = counts[index] || 0;
        const done = cur >= max;
        return (
            <View style={[styles.listCard, { backgroundColor: theme.card, borderColor: done ? theme.primary : theme.border }]}>
                <View style={styles.listCardTop}>
                    <View style={[styles.listBadge, { backgroundColor: theme.primary + '15' }]}>
                        <Text style={[styles.listBadgeTxt, { color: theme.primary }]}>{index + 1}</Text>
                    </View>
                    {done && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
                </View>
                <Text style={[styles.listZikrTxt, {
                    color: theme.text,
                    fontSize: 22 * FONT_SCALE[settings.fontSize],
                    lineHeight: 44 * FONT_SCALE[settings.fontSize]
                }]}>
                    {item.content || item.zekr}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        if (!done) {
                            if (settings.hapticFeedback) Haptics.selectionAsync().catch(() => { });
                            setCounts(prev => ({ ...prev, [index]: (prev[index] || 0) + 1 }));
                        }
                    }}
                    style={[styles.listCounter, { backgroundColor: done ? theme.primary : theme.card, borderColor: theme.primary }]}
                    activeOpacity={done ? 1 : 0.7}
                >
                    <Text style={[styles.listCounterTxt, { color: done ? '#fff' : theme.primary }]}>
                        {done ? '✓' : `${cur} / ${max}`}
                    </Text>
                </TouchableOpacity>
            </View>
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
                        <View style={[styles.modalIconWrap, { backgroundColor: theme.primary + '15' }]}>
                            <Ionicons name="refresh-circle-outline" size={44} color={theme.primary} />
                        </View>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>إعادة العد</Text>
                        <Text style={[styles.modalSub, { color: theme.textDim }]}>
                            هل تريد إعادة البدء من أول الأذكار؟{`\n`}سيتم إعادة ضبط جميع العدادات.
                        </Text>
                        <View style={styles.modalBtns}>
                            <TouchableOpacity onPress={() => setShowResetModal(false)} style={[styles.modalBtnCancel, { borderColor: theme.border }]} activeOpacity={0.75}>
                                <Text style={[styles.modalBtnCancelTxt, { color: theme.textDim }]}>إلغاء</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={doReset} style={[styles.modalBtnConfirm, { backgroundColor: theme.primary }]} activeOpacity={0.85}>
                                <Text style={styles.modalBtnConfirmTxt}>تأكيد</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* ── HEADER ── */}
            <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-forward" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                    <Text style={styles.headerSub}>{cardIndex + 1} / {azkar.length}</Text>
                </View>
                <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
                    <Ionicons name="share-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {/* ── PROGRESS BAR ── */}
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                <View style={[styles.progressFill, { backgroundColor: theme.primary, width: azkar.length > 0 ? `${((cardIndex + 1) / azkar.length) * 100}%` : '0%' }]} />
            </View>

            {/* ── RESET BUTTON ── */}
            <TouchableOpacity onPress={handleReset} style={[styles.resetBtn, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '40' }]} activeOpacity={0.7}>
                <Ionicons name="refresh" size={15} color={theme.primary} />
                <Text style={[styles.resetTxt, { color: theme.primary }]}>إعادة</Text>
            </TouchableOpacity>

            {/* ── CONTENT ── */}
            {viewMode === 'card' ? renderCard() : (
                <FlatList
                    data={azkar}
                    keyExtractor={(_, i) => `list-${i}`}
                    renderItem={renderListItem}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews
                    contentContainerStyle={styles.listContent}
                    windowSize={8}
                />
            )}
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1 },
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

    header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14 },
    headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Amiri-Bold', textAlign: 'center' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700', marginTop: 2 },

    progressTrack: { height: 4, width: '100%' },
    progressFill: { height: 4 },

    resetBtn: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1.5, gap: 6 },
    resetTxt: { fontFamily: 'Amiri-Bold', fontSize: 13 },

    cardScroll: { flex: 1 },
    cardContent: { padding: 24, paddingBottom: 40, flexGrow: 1 },
    cardIconBox: { alignSelf: 'center', width: 70, height: 70, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    zikrText: { fontSize: 28, fontFamily: 'Amiri-Regular', textAlign: 'right', lineHeight: 54, writingDirection: 'rtl', marginBottom: 16 },
    fadlBox: { borderRadius: 20, padding: 16, marginBottom: 12, alignItems: 'flex-end' },
    fadlText: { fontSize: 14, fontFamily: 'Amiri-Regular', textAlign: 'right', lineHeight: 26 },
    refText: { fontSize: 12, fontFamily: 'Amiri-Regular', textAlign: 'right', marginBottom: 20, fontStyle: 'italic' },
    counterRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
    sideBtn: { width: 52, height: 52, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    counterCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
    counterNum: { fontSize: 36, fontWeight: '900' },
    counterMax: { fontSize: 13, fontWeight: '700', marginTop: 2 },
    nextBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', height: 54, borderRadius: 20, marginTop: 10, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8 },
    nextBtnTxt: { color: '#fff', fontSize: 17, fontFamily: 'Amiri-Bold', marginRight: 10 },
    allDoneBox: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 20, marginTop: 10 },
    allDoneTxt: { fontSize: 18, fontFamily: 'Amiri-Bold', marginLeft: 10 },

    listContent: { padding: 16, paddingBottom: 120, flexGrow: 1 },
    listCard: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
    listCardTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    listBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    listBadgeTxt: { fontSize: 13, fontWeight: '900' },
    listZikrTxt: { fontSize: 22, fontFamily: 'Amiri-Regular', textAlign: 'right', lineHeight: 44, writingDirection: 'rtl', marginBottom: 14 },
    listCounter: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, borderWidth: 2 },
    listCounterTxt: { fontSize: 14, fontWeight: '900' },
});
