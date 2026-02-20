import React, { useState, useEffect } from "react";
import {
  FaMosque,
  FaSearch,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaCompass,
  FaArrowRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import axios from "axios";

function FindMosque() {
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMosques = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      // Increased timeout to 90s for dense cities like Cairo
      const overpassQuery = `
        [out:json][timeout:90];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:10000,${lat},${lon});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:10000,${lat},${lon});
          relation["amenity"="place_of_worship"]["religion"="muslim"](around:10000,${lat},${lon});
        );
        out center 100;
      `;

      const overpassResponse = await axios.get(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
      );

      if (overpassResponse.data && overpassResponse.data.elements) {
        const mosqueData = overpassResponse.data.elements.map((mosque) => ({
          id: mosque.id,
          name: mosque.tags?.name || mosque.tags?.["name:ar"] || mosque.tags?.["name:en"] || "Masjid",
          address: mosque.tags?.["addr:street"] || mosque.tags?.address || mosque.tags?.["addr:full"] || "Location detail not available",
          phone: mosque.tags?.phone || "Phone not available",
          website: mosque.tags?.website || null,
          distance: calculateDistance(lat, lon, mosque.lat || mosque.center?.lat, mosque.lon || mosque.center?.lon),
        }));

        setMosques(mosqueData.sort((a, b) => a.distance - b.distance));
      } else {
        setMosques([]);
      }
    } catch (error) {
      console.error("Overpass Error:", error);
      setError("The spiritual network is busy due to high density in this area. Please try again or be more specific.");
    } finally {
      setLoading(false);
    }
  };

  const searchMosques = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Primary search using Photon API (usually faster and less restricted)
      let lat, lon;
      try {
        const photonRes = await axios.get(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`
        );

        if (photonRes.data?.features?.length > 0) {
          const feature = photonRes.data.features[0];
          [lon, lat] = feature.geometry.coordinates;
        }
      } catch (err) {
        console.warn("Photon failed, trying Nominatim...");
      }

      // Fallback to Nominatim if Photon failed or found nothing
      if (!lat || !lon) {
        const nominatimRes = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
        );

        if (nominatimRes.data?.length > 0) {
          lat = nominatimRes.data[0].lat;
          lon = nominatimRes.data[0].lon;
        }
      }

      if (lat && lon) {
        await fetchMosques(lat, lon);
      } else {
        setError("We couldn't find that location. Please try a different city or check the spelling.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Search connection interrupted. Please check your internet or try again in a moment.");
      setLoading(false);
    }
  };

  const findNearMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchMosques(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError("Permission to access location was denied.");
        setLoading(false);
      }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat2 || !lon2) return "?";
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6">
            <FaCompass className="text-[10px]" />
            Community Finder
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Find Your <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Spiritual Home</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Connect with local mosques and prayer spaces in your area with our comprehensive directory.
          </p>
        </motion.div>

        {/* Search Experience */}
        <div className="max-w-xl mx-auto mb-16 space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-3xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="relative flex p-2 bg-white/80 dark:bg-[#0a1611]/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-emerald-500/5">
              <input
                type="text"
                placeholder="Enter city or neighborhood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-6 py-4 text-slate-900 dark:text-white focus:outline-none"
                onKeyPress={(e) => e.key === "Enter" && searchMosques()}
              />
              <button
                onClick={searchMosques}
                disabled={loading}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.5rem] font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <FaSearch />}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={findNearMe}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-white/10 transition-all active:scale-95 text-sm"
            >
              <FaMapMarkerAlt className="text-xs" />
              Find Mosques Near Me
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/10 text-red-600 dark:text-red-400 mb-12"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {mosques.map((mosque) => (
            <motion.div key={mosque.id} variants={itemVariants}>
              <div className="group h-full bg-white dark:bg-[#0a1611] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <FaMosque />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {mosque.distance} km
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Distance</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 group-hover:text-emerald-600 transition-colors">
                  {mosque.name}
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    <FaMapMarkerAlt className="mt-1 text-emerald-500/50 flex-shrink-0" />
                    <span>{mosque.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <FaPhone className="text-emerald-500/50 flex-shrink-0" />
                    <span>{mosque.phone}</span>
                  </div>
                </div>

                {mosque.website && (
                  <a
                    href={mosque.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:gap-3 transition-all"
                  >
                    Visit Website <FaArrowRight className="text-[10px]" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {mosques.length === 0 && !loading && !error && searchQuery && (
          <div className="text-center py-20">
            <div className="text-slate-200 dark:text-white/5 text-8xl mb-6 flex justify-center"><FaMosque /></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No sacred spaces found in this vicinity.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default FindMosque;

