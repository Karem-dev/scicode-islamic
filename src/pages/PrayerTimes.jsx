import React, { useState, useEffect, useMemo } from "react";
import {
  FaSun,
  FaMoon,
  FaCloudSun,
  FaCloudMoon,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import axios from "axios";
import PrayerReminderModal from "../components/PrayerReminderModal";

function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({
    city: "Cairo",
    country: "Egypt",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.aladhan.com/v1/timingsByCity?city=${location.city}&country=${location.country}&method=4`
        );
        setPrayerTimes(response.data.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => setShowReminder(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLocationChange = (loc) => {
    const [city, country] = loc.split(", ");
    setLocation({ city, country });
    setShowSearch(false);
    setSearchQuery("");
  };

  const prayerIcons = {
    Fajr: <FaCloudSun />,
    Sunrise: <FaSun />,
    Dhuhr: <FaSun />,
    Asr: <FaCloudSun />,
    Maghrib: <FaCloudMoon />,
    Isha: <FaMoon />,
  };

  const prayerNames = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
  };

  const getNextPrayer = useMemo(() => {
    if (!prayerTimes) return null;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const timings = prayerTimes.timings;

    const times = Object.keys(prayerIcons).map(p => {
      const [h, m] = timings[p].split(":").map(Number);
      return { name: p, minutes: h * 60 + m };
    });

    const next = times.find(t => t.minutes > now) || times[0];
    return next.name;
  }, [prayerTimes, currentTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-emerald-500/60 font-medium">Fetching Prayer Times...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main Info Column */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-4">
                <FaMapMarkerAlt className="text-xs" />
                {location.city}, {location.country}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Daily Prayer Schedule
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-emerald-500" />
                  <span>{prayerTimes?.date?.readable}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-emerald-500" />
                  <span>{prayerTimes?.date?.hijri?.date} Hijri</span>
                </div>
              </div>
            </motion.div>

            {/* Prayer Times Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(prayerIcons).map(([prayer, icon], idx) => {
                const isNext = prayer === getNextPrayer;
                return (
                  <motion.div
                    key={prayer}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`group relative p-6 rounded-3xl border transition-all duration-300 ${isNext
                        ? "bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-500/20 scale-[1.02] z-10"
                        : "bg-white dark:bg-[#0a1611] border-slate-100 dark:border-white/5 hover:border-emerald-500/30"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${isNext ? "bg-white/20 text-white" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}>
                          {icon}
                        </div>
                        <div>
                          <h3 className={`font-bold transition-colors ${isNext ? "text-white" : "text-slate-900 dark:text-white"}`}>
                            {prayer}
                          </h3>
                          <p className={`text-xs transition-colors ${isNext ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"}`}>
                            {prayerNames[prayer]}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-black tracking-tight transition-colors ${isNext ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {prayerTimes?.timings?.[prayer]}
                        </span>
                        {isNext && (
                          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 mt-1">Next Prayer</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:w-80">
            <div className="sticky top-32 space-y-6">

              {/* Location Search Box */}
              <div className="bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <FaSearch className="text-emerald-500 text-sm" />
                  Change Location
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search city..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearch(true);
                      }}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>

                  <AnimatePresence>
                    {(showSearch || searchQuery) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-h-60 overflow-y-auto space-y-1 pr-2"
                      >
                        {[
                          "Cairo, Egypt",
                          "Mansoura, Egypt",
                          "Alexandria, Egypt",
                          "Mecca, Saudi Arabia",
                          "Medina, Saudi Arabia",
                          "Dubai, UAE",
                          "Istanbul, Turkey",
                          "London, UK",
                          "New York, USA",
                        ]
                          .filter((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((loc) => (
                            <button
                              key={loc}
                              onClick={() => handleLocationChange(loc)}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 text-sm transition-colors"
                            >
                              {loc}
                            </button>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Decorative Tip Card */}
              <div className="bg-emerald-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <FaClock className="absolute top-0 right-0 text-[120px] opacity-10 -mr-8 -mt-8 rotate-12" />
                <h4 className="font-bold mb-2">Did you know?</h4>
                <p className="text-emerald-100 text-sm leading-relaxed">
                  Keeping up with prayer times is the best way to maintain a spiritual connection throughout your busy day.
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      <PrayerReminderModal
        isOpen={showReminder}
        onClose={() => setShowReminder(false)}
      />
    </div>
  );
}

export default PrayerTimes;
