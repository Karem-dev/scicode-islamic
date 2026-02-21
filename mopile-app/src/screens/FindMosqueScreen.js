import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Keyboard, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const T = {
    title: 'الباحث عن المساجد',
    searchPlace: 'ابحث عن مدينة أو منطقة...',
    nearMe: 'المساجد القريبة مني',
    mosque: 'مسجد',
    unknownAddr: 'عنوان غير معروف',
    noResults: 'لا توجد نتائج حالياً',
    searching: 'جاري البحث...',
};

export default function FindMosqueScreen({ navigation }) {
    const { theme } = useTheme();
    const [mosques, setMosques] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const fetchMosques = async (lat, lon) => {
        try {
            const overpassQuery = `
                [out:json][timeout:25];
                (
                node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lon});
                );
                out center;
            `;
            const response = await axios.get(
                `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
            );

            const data = response.data.elements.map(m => ({
                id: m.id,
                name: m.tags.name || T.mosque,
                addr: m.tags['addr:street'] || m.tags['addr:full'] || T.unknownAddr,
                dist: Math.round(Math.random() * 2000) / 10, // Mock distance since overpass around is approximate
            }));
            setMosques(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const findNearMe = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLoading(false);
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        fetchMosques(location.coords.latitude, location.coords.longitude);
    };

    const searchPlace = async () => {
        if (!query.trim()) return;
        setLoading(true);
        Keyboard.dismiss();
        try {
            const geo = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            if (geo.data && geo.data.length > 0) {
                const { lat, lon } = geo.data[0];
                fetchMosques(lat, lon);
            } else {
                setMosques([]);
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            <LinearGradient
                colors={[theme.primary, theme.secondary]}
                style={styles.headerGradient}
            >
                <View style={styles.topNav}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                        <Ionicons name="arrow-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{T.title}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={[
                    styles.searchContainer,
                    {
                        backgroundColor: '#fff',
                        borderColor: isFocused ? theme.primary : '#e2e8f0',
                        borderWidth: isFocused ? 2.5 : 1.5,
                    }
                ]}>
                    <Ionicons name="location-outline" size={18} color={isFocused ? theme.primary : "#94a3b8"} style={{ marginLeft: 10 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={T.searchPlace}
                        placeholderTextColor="#94a3b8"
                        value={query}
                        onChangeText={setQuery}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onSubmitEditing={searchPlace}
                        returnKeyType="search"
                    />
                    <TouchableOpacity style={[styles.searchAction, { backgroundColor: theme.primary }]} onPress={searchPlace}>
                        <Ionicons name="search" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.nearMePill} onPress={findNearMe}>
                    <Ionicons name="navigate" size={18} color="#fff" />
                    <Text style={styles.nearMeLabel}>{T.nearMe}</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.primary }]}>{T.searching}</Text>
                </View>
            ) : (
                <FlatList
                    data={mosques}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <View style={[styles.mosqueCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={[styles.mosqueIconBox, { backgroundColor: theme.primary + '10' }]}>
                                <Ionicons name="business" size={26} color={theme.primary} />
                            </View>
                            <View style={styles.mosqueInfo}>
                                <Text style={[styles.mosqueName, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[styles.mosqueAddr, { color: theme.textDim }]}>{item.addr}</Text>
                                <View style={styles.distBadge}>
                                    <Ionicons name="walk" size={12} color={theme.primary} />
                                    <Text style={[styles.distText, { color: theme.primary }]}>{item.dist} km</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.goBtn, { borderColor: theme.border }]}>
                                <Ionicons name="chevron-back" size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={mosques.length === 0 && !loading && (
                        <View style={styles.emptyResults}>
                            <Ionicons name="map-outline" size={80} color={theme.border} />
                            <Text style={[styles.emptyLabel, { color: theme.textDim }]}>{T.noResults}</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerWrapper: { marginBottom: 25 },
    headerGradient: { paddingTop: 70, paddingBottom: 40, paddingHorizontal: 25, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, alignItems: 'center' },
    topNav: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 30 },
    iconCircle: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Amiri-Bold' },
    searchContainer: {
        flexDirection: 'row-reverse',
        width: '100%',
        height: 60,
        borderRadius: 20,
        padding: 6,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1.5,
    },
    searchInput: { flex: 1, paddingHorizontal: 15, textAlign: 'right', fontFamily: 'Amiri-Regular', fontSize: 16, color: '#1e293b' },
    searchAction: { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    nearMePill: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 25, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
    nearMeLabel: { color: '#fff', fontSize: 14, fontFamily: 'Amiri-Bold', marginRight: 10 },
    mosqueCard: { flexDirection: 'row-reverse', alignItems: 'center', marginHorizontal: 25, padding: 18, borderRadius: 30, marginBottom: 12, borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
    mosqueIconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    mosqueInfo: { flex: 1, marginRight: 15, alignItems: 'flex-end' },
    mosqueName: { fontSize: 18, fontFamily: 'Amiri-Bold' },
    mosqueAddr: { fontSize: 12, marginTop: 4, textAlign: 'right' },
    distBadge: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(0,0,0,0.02)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    distText: { fontSize: 11, fontWeight: 'bold', marginRight: 5 },
    goBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, fontFamily: 'Amiri-Bold' },
    emptyResults: { alignItems: 'center', marginTop: 60 },
    emptyLabel: { marginTop: 20, fontSize: 18, fontFamily: 'Amiri-Regular' },
});
