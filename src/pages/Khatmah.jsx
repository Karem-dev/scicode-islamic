import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaBookOpen,
    FaCheckCircle,
    FaRegCircle,
    FaStar,
    FaHistory,
    FaSearch,
    FaTrashAlt,
    FaAward
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import axios from "axios";
import { Link } from "react-router-dom";

function Khatmah() {
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [completedSurahs, setCompletedSurahs] = useState(() => {
        const saved = localStorage.getItem("islamic_completed_surahs");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const response = await axios.get("https://api.alquran.cloud/v1/surah");
                setSurahs(response.data.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load Surahs for tracking.");
                setLoading(false);
            }
        };
        fetchSurahs();
    }, []);

    useEffect(() => {
        localStorage.setItem("islamic_completed_surahs", JSON.stringify(completedSurahs));
    }, [completedSurahs]);

    const toggleSurah = (surahNumber) => {
        setCompletedSurahs(prev =>
            prev.includes(surahNumber)
                ? prev.filter(n => n !== surahNumber)
                : [...prev, surahNumber]
        );
    };

    const resetProgress = () => {
        if (window.confirm("Are you sure you want to reset all progress?")) {
            setCompletedSurahs([]);
        }
    };

    const filteredSurahs = surahs.filter(s =>
        s.name.includes(searchQuery) ||
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const progressPercentage = surahs.length > 0
        ? Math.round((completedSurahs.length / surahs.length) * 100)
        : 0;

    if (loading) return (
        <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500 overflow-x-hidden">
            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20 max-w-5xl">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6">
                            <FaHistory className="text-[10px]" />
                            Track Your Journey
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                            Quran <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Khatmah</span> Tracker
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                            Monitor your progress as you memorize or read through the Holy Quran. Every mark is a step closer to divine mastery.
                        </p>
                    </motion.div>
                </div>

                {/* Progress Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-8 md:p-12 text-white mb-16 shadow-2xl shadow-emerald-500/20 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
                        <FaAward className="text-[200px]" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="relative w-32 h-32 md:w-44 md:h-44 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="50%" cy="50%" r="45%"
                                    fill="transparent"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="8"
                                />
                                <motion.circle
                                    cx="50%" cy="50%" r="45%"
                                    fill="transparent"
                                    stroke="white"
                                    strokeWidth="8"
                                    strokeDasharray="283"
                                    initial={{ strokeDashoffset: 283 }}
                                    animate={{ strokeDashoffset: 283 - (283 * progressPercentage) / 100 }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl md:text-5xl font-black">{progressPercentage}%</span>
                                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">Complete</span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">Overall Completion</h2>
                            <p className="text-emerald-50/80 mb-8 max-w-md">
                                You have completed <span className="text-white font-bold">{completedSurahs.length}</span> out of <span className="text-white font-bold">{surahs.length}</span> Surahs. Keep going, the light of Quran illuminates your path.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <button
                                    onClick={resetProgress}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all border border-white/10"
                                >
                                    <FaTrashAlt className="text-xs" /> Reset All
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-6 mb-10 items-center">
                    <div className="relative flex-1 w-full">
                        <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Surah name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 rounded-[2rem] py-5 px-16 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/50 shadow-sm"
                        />
                    </div>
                </div>

                {/* Surahs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredSurahs.map((surah) => (
                            <motion.div
                                layout
                                key={surah.number}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => toggleSurah(surah.number)}
                                className={`group cursor-pointer relative p-6 rounded-[2.5rem] border transition-all duration-300 flex items-center gap-6 ${completedSurahs.includes(surah.number)
                                    ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500/30 shadow-xl shadow-emerald-500/5"
                                    : "bg-white dark:bg-[#0a1611] border-slate-100 dark:border-white/5 hover:border-emerald-500/20"
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${completedSurahs.includes(surah.number)
                                    ? "bg-emerald-600 text-white"
                                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    }`}>
                                    {completedSurahs.includes(surah.number) ? <FaCheckCircle /> : <FaRegCircle />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Surah {surah.number}
                                        </span>
                                        {completedSurahs.includes(surah.number) && (
                                            <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Finished</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-0.5">
                                        {surah.englishName}
                                    </h3>
                                    <p className="text-sm font-arabic text-emerald-600 dark:text-emerald-400">
                                        {surah.name}
                                    </p>
                                </div>

                                <Link
                                    to={`/surah/${surah.number}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-500 rounded-xl transition-all"
                                >
                                    <FaBookOpen />
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredSurahs.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-slate-200 dark:text-white/5 text-8xl mb-6 flex justify-center"><FaSearch /></div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No results matching your quest.</p>
                    </div>
                )}
            </main>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&display=swap');
        .font-arabic { font-family: 'Amiri', serif; }
      `}</style>
        </div>
    );
}

export default Khatmah;
