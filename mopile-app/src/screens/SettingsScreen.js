import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Switch, StatusBar, Alert, Linking,
    PanResponder, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAppSettings, FONT_SCALE } from '../context/AppSettingsContext';
import { themes } from '../constants/theme';
import { LIST_PADDING_BOTTOM } from '../constants/layout';

// ── App version ───────────────────────────────────────────────────────────────
const APP_VERSION = '1.0.0';

// ── Theme palette cards ───────────────────────────────────────────────────────
const THEME_LIST = [
    { key: 'Dark', label: 'ليلي', icon: 'moon', primary: '#10b981', bg: '#060d0a' },
    { key: 'Light', label: 'نهاري', icon: 'sunny', primary: '#059669', bg: '#f5f8f6' },
    { key: 'Gold', label: 'ذهبي', icon: 'sparkles', primary: '#d97706', bg: '#0d0a04' },
    { key: 'Blue', label: 'أزرق', icon: 'water', primary: '#3b82f6', bg: '#040a14' },
];

// ── Font size options ─────────────────────────────────────────────────────────
const FONT_OPTIONS = [
    { key: 'small', label: 'صغير', size: 14 },
    { key: 'medium', label: 'متوسط', size: 17 },
    { key: 'large', label: 'كبير', size: 20 },
    { key: 'xlarge', label: 'كبير جداً', size: 24 },
];

// ── Section title ─────────────────────────────────────────────────────────────
function SectionTitle({ title, icon, color }) {
    return (
        <View style={styles.sectionTitle}>
            <Ionicons name={icon} size={18} color={color} style={{ marginLeft: 10 }} />
            <Text style={[styles.sectionTitleTxt, { color }]}>{title}</Text>
        </View>
    );
}

// ── Setting row with toggle ───────────────────────────────────────────────────
function SettingToggle({ label, desc, value, onValueChange, color }) {
    return (
        <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
                <Text style={styles.settingLabel}>{label}</Text>
                {desc ? <Text style={styles.settingDesc}>{desc}</Text> : null}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: color + '60' }}
                thumbColor={value ? color : '#888'}
                ios_backgroundColor="rgba(255,255,255,0.1)"
            />
        </View>
    );
}

// ── Brightness Slider (custom, no external lib) ───────────────────────────────
const SLIDER_WIDTH = Dimensions.get('window').width - 36 - 40 - 40; // card padding + icons

function BrightnessSlider({ value, onChange, color }) {
    const sliderRef = useRef(null);
    const [sliderX, setSliderX] = useState(0);

    const clamp = (v) => Math.min(1, Math.max(0.05, v));

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                const x = e.nativeEvent.locationX;
                onChange(clamp(x / SLIDER_WIDTH));
            },
            onPanResponderMove: (e) => {
                const x = e.nativeEvent.locationX;
                onChange(clamp(x / SLIDER_WIDTH));
            },
        })
    ).current;

    const fillW = Math.max(4, value * SLIDER_WIDTH);
    const pct = Math.round(value * 100);

    return (
        <View style={styles.brightnessWrap}>
            {/* Icons + percent */}
            <View style={styles.brightnessRow}>
                <Ionicons name="moon" size={18} color={color + '80'} />

                {/* Track */}
                <View
                    style={[styles.sliderTrack, { backgroundColor: color + '20' }]}
                    {...panResponder.panHandlers}
                    ref={sliderRef}
                >
                    {/* Fill */}
                    <View style={[styles.sliderFill, { width: fillW, backgroundColor: color }]} />
                    {/* Thumb */}
                    <View style={[
                        styles.sliderThumb,
                        { left: fillW - 12, backgroundColor: color, borderColor: '#fff' }
                    ]} />
                </View>

                <Ionicons name="sunny" size={20} color={color} />
            </View>

            {/* Percentage + presets */}
            <View style={styles.brightnessFooter}>
                <View style={[styles.pctBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.pctTxt, { color }]}>{pct}%</Text>
                </View>
                <View style={styles.presetRow}>
                    {[0.15, 0.35, 0.6, 0.8, 1.0].map(p => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => onChange(p)}
                            style={[styles.presetBtn, {
                                backgroundColor: Math.abs(value - p) < 0.05 ? color : color + '18',
                                borderColor: Math.abs(value - p) < 0.05 ? color : 'transparent',
                            }]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.presetTxt, {
                                color: Math.abs(value - p) < 0.05 ? '#fff' : color,
                            }]}>{Math.round(p * 100)}%</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
    const { theme, toggleTheme } = useTheme();
    const { settings, updateSetting, resetSettings } = useAppSettings();
    const insets = useSafeAreaInsets();

    // Local state for "reset all data" confirmation modal
    const [showResetModal, setShowResetModal] = useState(false);

    const currentThemeName = themes[Object.keys(themes).find(k => themes[k].primary === theme.primary)]?.name || 'Dark';

    // ── Reset all app data ────────────────────────────────────────────────────
    const handleFullReset = async () => {
        try {
            await AsyncStorage.multiRemove([
                'khatmah_progress',
                'last_read',
                'app_theme',
                'app_settings',
                'has_onboarded',
            ]);
            Alert.alert('✅ تم المسح', 'تمت إعادة ضبط جميع بيانات التطبيق.\nأعد تشغيل التطبيق لتطبيق التغييرات.');
        } catch (_) {
            Alert.alert('خطأ', 'تعذر مسح البيانات.');
        } finally {
            setShowResetModal(false);
        }
    };

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scroll, { paddingBottom: LIST_PADDING_BOTTOM }]}
            >
                {/* ── GRADIENT HEADER ──────────────────────────────────── */}
                <LinearGradient
                    colors={[theme.primary, theme.secondary]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[styles.header, { paddingTop: insets.top + 24 }]}
                >
                    <View style={styles.headerIconWrap}>
                        <Ionicons name="settings" size={36} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>الإعدادات</Text>
                    <Text style={styles.headerSub}>تحكم في مظهر وسلوك التطبيق</Text>
                </LinearGradient>

                {/* ── APPEARANCE ──────────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SectionTitle title="المظهر" icon="color-palette" color={theme.primary} />

                    {/* Theme selector */}
                    <Text style={[styles.rowLabel, { color: theme.textDim }]}>اختر ثيم التطبيق</Text>
                    <View style={styles.themeGrid}>
                        {THEME_LIST.map(t => {
                            const isActive = themes[t.key]?.primary === theme.primary;
                            return (
                                <TouchableOpacity
                                    key={t.key}
                                    onPress={() => toggleTheme(t.key)}
                                    style={[styles.themeCard, {
                                        backgroundColor: t.bg,
                                        borderColor: isActive ? t.primary : 'transparent',
                                        borderWidth: isActive ? 2.5 : 1.5,
                                    }]}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name={t.icon} size={22} color={isActive ? t.primary : '#888'} />
                                    <Text style={[styles.themeLabel, { color: isActive ? t.primary : '#aaa' }]}>
                                        {t.label}
                                    </Text>
                                    {isActive && (
                                        <View style={[styles.themeCheck, { backgroundColor: t.primary }]}>
                                            <Ionicons name="checkmark" size={10} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── FONT SIZE ────────────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SectionTitle title="حجم الخط" icon="text" color={theme.primary} />
                    <Text style={[styles.rowLabel, { color: theme.textDim }]}>حجم النصوص العربية في الأذكار والقرآن</Text>

                    <View style={styles.fontRow}>
                        {FONT_OPTIONS.map(f => {
                            const isActive = settings.fontSize === f.key;
                            return (
                                <TouchableOpacity
                                    key={f.key}
                                    onPress={() => updateSetting('fontSize', f.key)}
                                    style={[styles.fontPill, {
                                        backgroundColor: isActive ? theme.primary : theme.primary + '12',
                                        borderColor: isActive ? theme.primary : theme.border,
                                    }]}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[
                                        styles.fontPillTxt,
                                        { color: isActive ? '#fff' : theme.textDim, fontSize: f.size * 0.6 + 8 }
                                    ]}>
                                        {f.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Live preview */}
                    <View style={[styles.fontPreview, { backgroundColor: theme.primary + '0D', borderColor: theme.border }]}>
                        <Text style={[styles.fontPreviewTxt, {
                            color: theme.text,
                            fontSize: FONT_SCALE[settings.fontSize] * 22,
                            lineHeight: FONT_SCALE[settings.fontSize] * 38,
                        }]}>
                            سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
                        </Text>
                    </View>
                </View>

                {/* ── BRIGHTNESS ───────────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SectionTitle title="الإضاءة" icon="sunny" color={theme.primary} />
                    <Text style={[styles.rowLabel, { color: theme.textDim }]}>
                        تحكم في سطوع الشاشة أثناء استخدام التطبيق
                    </Text>
                    <BrightnessSlider
                        value={settings.brightness ?? 0.8}
                        onChange={v => updateSetting('brightness', parseFloat(v.toFixed(2)))}
                        color={theme.primary}
                    />
                </View>

                {/* ── BEHAVIOUR ────────────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SectionTitle title="السلوك" icon="options" color={theme.primary} />

                    <SettingToggle
                        label="الانتقال التلقائي"
                        desc="ينتقل للذكر التالي بعد اكتمال العدد"
                        value={settings.autoAdvance}
                        onValueChange={v => updateSetting('autoAdvance', v)}
                        color={theme.primary}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingToggle
                        label="الاهتزاز عند الضغط"
                        desc="اهتزاز خفيف عند عد الأذكار"
                        value={settings.hapticFeedback}
                        onValueChange={v => updateSetting('hapticFeedback', v)}
                        color={theme.primary}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingToggle
                        label="إبقاء الشاشة مضاءة"
                        desc="لا تُطفئ الشاشة أثناء قراءة الأذكار"
                        value={settings.keepScreenOn}
                        onValueChange={v => updateSetting('keepScreenOn', v)}
                        color={theme.primary}
                    />
                </View>

                {/* ── DATA MANAGEMENT ──────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SectionTitle title="إدارة البيانات" icon="server" color={theme.primary} />

                    <TouchableOpacity
                        style={[styles.actionRow, { borderColor: theme.border }]}
                        onPress={resetSettings}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: theme.primary + '18' }]}>
                            <Ionicons name="refresh" size={18} color={theme.primary} />
                        </View>
                        <View style={styles.actionText}>
                            <Text style={[styles.actionLabel, { color: theme.text }]}>إعادة ضبط الإعدادات</Text>
                            <Text style={[styles.actionDesc, { color: theme.textDim }]}>إرجاع جميع الإعدادات للقيم الافتراضية</Text>
                        </View>
                        <Ionicons name="chevron-back" size={16} color={theme.textDim} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity
                        style={[styles.actionRow, { borderColor: theme.border }]}
                        onPress={() => setShowResetModal(true)}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#ef444420' }]}>
                            <Ionicons name="trash" size={18} color="#ef4444" />
                        </View>
                        <View style={styles.actionText}>
                            <Text style={[styles.actionLabel, { color: '#ef4444' }]}>مسح جميع بيانات التطبيق</Text>
                            <Text style={[styles.actionDesc, { color: theme.textDim }]}>يشمل تقدم الختمة وآخر قراءة</Text>
                        </View>
                        <Ionicons name="chevron-back" size={16} color={theme.textDim} />
                    </TouchableOpacity>
                </View>

                {/* ── ABOUT ────────────────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <SectionTitle title="عن التطبيق" icon="information-circle" color={theme.primary} />

                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutKey, { color: theme.textDim }]}>الإصدار</Text>
                        <Text style={[styles.aboutVal, { color: theme.text }]}>{APP_VERSION}</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity
                        style={styles.aboutRow}
                        onPress={() => Linking.openURL('https://karem-mahmoud.vercel.app').catch(() => { })}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.aboutKey, { color: theme.textDim }]}>المطوّر</Text>
                        <Text style={[styles.aboutVal, { color: theme.primary }]}>Karem Mahmoud</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity
                        style={styles.aboutRow}
                        onPress={() => Linking.openURL('http://scicodeacademy.infinityfreeapp.com/').catch(() => { })}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.aboutKey, { color: theme.textDim }]}>الاكاديميه</Text>
                        <Ionicons name="chevron-back" size={16} color={theme.textDim} />
                    </TouchableOpacity>
                </View>

                {/* ── DANGER ZONE MODAL ────────────────────────────────── */}
                {showResetModal && (
                    <View style={styles.inlineModalOverlay}>
                        <View style={[styles.inlineModal, { backgroundColor: theme.card }]}>
                            <Ionicons name="warning-outline" size={44} color="#ef4444" style={{ marginBottom: 16 }} />
                            <Text style={[styles.dangerTitle, { color: theme.text }]}>مسح كل البيانات</Text>
                            <Text style={[styles.dangerSub, { color: theme.textDim }]}>
                                سيتم حذف تقدم الختمة، آخر سورة مقروءة، والإعدادات.{'\n'}هذا الإجراء لا يمكن التراجع عنه.
                            </Text>
                            <View style={styles.dangerBtns}>
                                <TouchableOpacity
                                    onPress={() => setShowResetModal(false)}
                                    style={[styles.dangerBtnCancel, { borderColor: theme.border }]}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[styles.dangerBtnCancelTxt, { color: theme.textDim }]}>إلغاء</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleFullReset}
                                    style={styles.dangerBtnConfirm}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.dangerBtnConfirmTxt}>نعم، امسح الكل</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingHorizontal: 18 },

    // Header
    header: {
        alignItems: 'center',
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        marginHorizontal: -18,
        marginBottom: 24,
    },
    headerIconWrap: {
        width: 72, height: 72, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 14,
    },
    headerTitle: { color: '#fff', fontSize: 30, fontFamily: 'Amiri-Bold' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontFamily: 'Amiri-Regular', marginTop: 4 },

    // Cards
    card: {
        borderRadius: 28, borderWidth: 1.5,
        padding: 20, marginBottom: 16,
    },

    // Section titles
    sectionTitle: { marginBottom: 16, flexDirection: 'row-reverse', alignItems: 'center' },
    sectionTitleTxt: { fontSize: 16, fontFamily: 'Amiri-Bold', textAlign: 'right' },

    rowLabel: { fontSize: 12, fontFamily: 'Amiri-Regular', textAlign: 'right', marginBottom: 12 },

    // Theme grid
    themeGrid: { flexDirection: 'row-reverse', gap: 10, flexWrap: 'wrap' },
    themeCard: {
        flex: 1, minWidth: 72,
        borderRadius: 18, padding: 14,
        alignItems: 'center', gap: 6,
        position: 'relative',
    },
    themeLabel: { fontFamily: 'Amiri-Bold', fontSize: 12 },
    themeCheck: {
        position: 'absolute', top: 6, left: 6,
        width: 18, height: 18, borderRadius: 9,
        justifyContent: 'center', alignItems: 'center',
    },

    // Font size
    fontRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    fontPill: {
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 14, borderWidth: 1.5,
    },
    fontPillTxt: { fontFamily: 'Amiri-Bold' },
    fontPreview: {
        borderRadius: 18, borderWidth: 1,
        padding: 18, alignItems: 'center',
    },
    fontPreviewTxt: { fontFamily: 'Amiri-Regular', textAlign: 'center' },

    // Setting toggles
    settingRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    settingRowLeft: { flex: 1, alignItems: 'flex-end', marginLeft: 12 },
    settingLabel: { color: '#fff', fontFamily: 'Amiri-Bold', fontSize: 15, textAlign: 'right' },
    settingDesc: { color: 'rgba(255,255,255,0.4)', fontFamily: 'Amiri-Regular', fontSize: 11, textAlign: 'right', marginTop: 2 },

    divider: { height: 1, marginVertical: 2 },

    // Action rows
    actionRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: 14, gap: 12,
    },
    actionIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    actionText: { flex: 1, alignItems: 'flex-end' },
    actionLabel: { fontFamily: 'Amiri-Bold', fontSize: 15, textAlign: 'right' },
    actionDesc: { fontFamily: 'Amiri-Regular', fontSize: 11, textAlign: 'right', marginTop: 2 },

    // About rows
    aboutRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    aboutKey: { fontFamily: 'Amiri-Regular', fontSize: 14 },
    aboutVal: { fontFamily: 'Amiri-Bold', fontSize: 14 },

    // Inline danger modal
    inlineModalOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center',
        borderRadius: 28, margin: -20, padding: 24,
    },
    inlineModal: {
        width: '100%', borderRadius: 28,
        padding: 28, alignItems: 'center',
        elevation: 20, shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16,
    },
    dangerTitle: { fontFamily: 'Amiri-Bold', fontSize: 20, marginBottom: 10, textAlign: 'center' },
    dangerSub: { fontFamily: 'Amiri-Regular', fontSize: 13, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    dangerBtns: { flexDirection: 'row-reverse', gap: 10, width: '100%' },
    dangerBtnCancel: {
        flex: 1, height: 48, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
    },
    dangerBtnCancelTxt: { fontFamily: 'Amiri-Bold', fontSize: 14 },
    dangerBtnConfirm: {
        flex: 1.4, height: 48, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#ef4444',
    },
    dangerBtnConfirmTxt: { color: '#fff', fontFamily: 'Amiri-Bold', fontSize: 14 },

    // Brightness slider
    brightnessWrap: { paddingTop: 4 },
    brightnessRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    sliderTrack: {
        flex: 1,
        height: 10,
        borderRadius: 5,
        overflow: 'visible',
        position: 'relative',
        justifyContent: 'center',
    },
    sliderFill: {
        position: 'absolute',
        left: 0, height: 10,
        borderRadius: 5,
    },
    sliderThumb: {
        position: 'absolute',
        width: 24, height: 24,
        borderRadius: 12,
        borderWidth: 2.5,
        top: -7,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    brightnessFooter: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    pctBadge: {
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 10,
    },
    pctTxt: { fontFamily: 'Amiri-Bold', fontSize: 13 },
    presetRow: { flexDirection: 'row', gap: 6 },
    presetBtn: {
        paddingHorizontal: 9, paddingVertical: 5,
        borderRadius: 9, borderWidth: 1.5,
    },
    presetTxt: { fontFamily: 'Amiri-Bold', fontSize: 11 },
});
