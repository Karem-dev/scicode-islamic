import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, TextInput, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { offlineData } from '../utils/offlineData';
import { getAzkarMeta } from '../utils/azkarIcons';
import { LIST_PADDING_BOTTOM } from '../constants/layout';

// ── Strip tashkeel for easy search ─────────────────────────────────────────
const normalize = (str = '') =>
    str
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // harakat
        .replace(/[\u0622\u0623\u0625]/g, '\u0627')  // alef forms
        .replace(/\u0629/g, '\u0647')               // ة → ه
        .toLowerCase().trim();

// ── Category Card ─────────────────────────────────────────────────────
const AzkarCategoryCard = memo(({ item, theme, onPress }) => {
    const { icon, colors } = getAzkarMeta(item.category || item.name || '');
    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <LinearGradient colors={colors} style={styles.cardIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={icon} size={26} color="#fff" />
            </LinearGradient>
            <View style={styles.cardMeta}>
                <Text style={[styles.cardName, { color: theme.text }]}>
                    {item.category || item.name}
                </Text>
                {item.data?.length
                    ? <Text style={[styles.cardCount, { color: theme.textDim }]}>{item.data.length} ذكر</Text>
                    : null}
            </View>
            <View style={[styles.arrow, { backgroundColor: colors[0] + '18' }]}>
                <Ionicons name="chevron-back" size={16} color={colors[0]} />
            </View>
        </TouchableOpacity>
    );
});

export default function AzkarScreen({ navigation }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            let data = await offlineData.getAzkar();
            if (!data) data = await offlineData.preloadAzkar();
            if (!alive) return;
            setCategories(data || []);
            setLoading(false);
        })();
        return () => { alive = false; };
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return categories;
        const q = normalize(search);
        return categories.filter(c =>
            normalize(c.category || c.name || '').includes(q)
        );
    }, [categories, search]);

    const keyExtractor = useCallback((item, i) => `azkar-${i}`, []);
    const onPress = useCallback((item) => navigation.navigate('AzkarReader', { category: item }), [navigation]);

    const renderItem = useCallback(({ item }) => (
        <AzkarCategoryCard item={item} theme={theme} onPress={() => onPress(item)} />
    ), [theme, onPress]);

    if (loading) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadTxt, { color: theme.primary }]}>جاري تحميل الأذكار...</Text>
        </View>
    );

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />
            <FlatList
                data={filtered}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
                windowSize={8}
                initialNumToRender={12}
                contentContainerStyle={[styles.listContent, { paddingBottom: LIST_PADDING_BOTTOM }]}
                ListHeaderComponent={
                    <View style={styles.headerWrap}>
                        {/* Gradient header */}
                        <LinearGradient
                            colors={[theme.primary, theme.secondary]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={[styles.grad, { paddingTop: insets.top + 30 }]}
                        >
                            <View style={styles.gradIconBox}>
                                <Ionicons name="leaf" size={36} color="rgba(255,255,255,0.9)" />
                            </View>
                            <Text style={styles.gradTitle}>حصن المسلم</Text>
                            <Text style={styles.gradSub}>أذكار اليوم والليلة</Text>
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
                                placeholder="ابحث عن ذكر..."
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
                                وجدنا {filtered.length} ذكر
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
                                <Text style={styles.resetSearchTxt}>عرض كل الأذكار</Text>
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
    gradIconBox: {
        width: 80, height: 80, borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    gradTitle: { color: '#fff', fontSize: 32, fontFamily: 'Amiri-Bold', marginBottom: 6 },
    gradSub: { color: 'rgba(255,255,255,0.75)', fontFamily: 'Amiri-Regular', fontSize: 15 },
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
    cardIcon: { width: 58, height: 58, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 14 },
    cardMeta: { flex: 1 },
    cardName: { fontSize: 18, fontFamily: 'Amiri-Bold', textAlign: 'right' },
    cardCount: { fontSize: 12, textAlign: 'right', marginTop: 4, fontFamily: 'Amiri-Regular' },
    arrow: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});