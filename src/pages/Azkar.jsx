import React, { useState, useEffect } from "react";
import {
  FaSun,
  FaMoon,
  FaPray,
  FaArrowLeft,
  FaCheckCircle,
  FaUndo,
  FaExternalLinkAlt,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PrayerReminderModal from "../components/PrayerReminderModal";
import Modal from "../components/Modal";
import { motion, AnimatePresence } from "framer-motion";

function Azkar() {
  const [azkarData, setAzkarData] = useState({
    sabah: [],
    massa: [],
    postPrayer: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counters, setCounters] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { category } = useParams();
  const [showReminder, setShowReminder] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    const fetchAzkar = async () => {
      try {
        const [sabahRes, massaRes, postPrayerRes] = await Promise.all([
          axios.get("https://ahegazy.github.io/muslimKit/json/azkar_sabah.json"),
          axios.get("https://ahegazy.github.io/muslimKit/json/azkar_massa.json"),
          axios.get("https://ahegazy.github.io/muslimKit/json/PostPrayer_azkar.json"),
        ]);

        setAzkarData({
          sabah: sabahRes.data.content,
          massa: massaRes.data.content,
          postPrayer: postPrayerRes.data.content,
        });
        setLoading(false);
      } catch (error) {
        setError("Error loading Azkar. Please check your connection.");
        setLoading(false);
      }
    };
    fetchAzkar();
  }, []);

  useEffect(() => {
    if (!category) {
      const timer = setTimeout(() => setShowReminder(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [category]);

  const tabConfig = [
    {
      id: "sabah",
      label: "Morning Azkar",
      labelAr: "أذكار الصباح",
      icon: <FaSun />,
      data: azkarData.sabah,
      color: "from-amber-400 to-orange-500",
      description: "Start your day with protection and divine remembrance.",
    },
    {
      id: "massa",
      label: "Evening Azkar",
      labelAr: "أذكار المساء",
      icon: <FaMoon />,
      data: azkarData.massa,
      color: "from-indigo-400 to-purple-600",
      description: "Find peace and protection as the day comes to a close.",
    },
    {
      id: "postPrayer",
      label: "After Prayer",
      labelAr: "بعد الصلاة",
      icon: <FaPray />,
      data: azkarData.postPrayer,
      color: "from-emerald-400 to-teal-600",
      description: "Complete your worship with these profound supplications.",
    },
  ];

  const incrementCounter = (idx) => {
    const currentCategory = tabConfig.find((tab) => tab.id === category);
    if (!currentCategory) return;

    const target = currentCategory.data[idx].repeat;
    const current = counters[idx] || 0;

    // Prevent counting if already completed for this specific item
    if (current >= target) return;

    const nextValue = current + 1;
    setCounters((prev) => ({ ...prev, [idx]: nextValue }));

    // If we just hit the target, trigger the transition
    if (nextValue >= target && idx === currentIndex) {
      if (currentIndex + 1 < currentCategory.data.length) {
        // Reduced delay slightly for better response, but kept lock active
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 400);
      } else {
        setTimeout(() => setShowCompletionModal(true), 600);
      }
    }
  };

  const resetAll = () => {
    setCounters({});
    setCurrentIndex(0);
    setShowCompletionModal(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-6xl">
        {!category ? (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Sacred Remembrances
              </h1>
              <p className="text-slate-500 dark:text-emerald-500/60 font-medium">Select a collection to begin your Azkar</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-3"
            >
              {tabConfig.map((tab) => (
                <motion.div key={tab.id} variants={itemVariants}>
                  <button
                    onClick={() => navigate(`/azkar/${tab.id}`)}
                    className="w-full text-left group bg-white dark:bg-[#0a1611] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tab.color} flex items-center justify-center text-white text-2xl mb-6 shadow-inner`}>
                      {tab.icon}
                    </div>
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{tab.labelAr}</h3>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">{tab.label}</p>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {tab.description}
                    </p>
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      {tab.data.length} Remembrances <FaExternalLinkAlt className="ml-2 text-[10px]" />
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Detailed Reader Mode */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate("/azkar")}
                  className="p-3 rounded-2xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  <FaArrowLeft />
                </button>
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-bold dark:text-white uppercase tracking-widest text-emerald-600">
                    {tabConfig.find(t => t.id === category)?.label}
                  </h2>
                  <div className="flex gap-1 mt-2">
                    {tabConfig.find(t => t.id === category)?.data.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6 bg-emerald-500" : i < currentIndex ? "w-2 bg-emerald-700/50" : "w-1.5 bg-slate-200 dark:bg-white/10"
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={resetAll}
                  className="p-3 rounded-2xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 text-slate-500 hover:text-orange-500 transition-colors"
                  title="Reset Collection"
                >
                  <FaUndo className="text-sm" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="relative"
                >
                  <div className="bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-emerald-500/5 min-h-[400px] flex flex-col items-center justify-center text-center">

                    <p
                      className="text-3xl md:text-4xl font-arabic leading-[1.8] dark:text-white mb-10 select-none cursor-pointer"
                      onClick={() => incrementCounter(currentIndex)}
                    >
                      {tabConfig.find(t => t.id === category)?.data[currentIndex]?.zekr}
                    </p>

                    {tabConfig.find(t => t.id === category)?.data[currentIndex]?.bless && (
                      <div className="max-w-md p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 text-sm italic mb-10">
                        {tabConfig.find(t => t.id === category)?.data[currentIndex]?.bless}
                      </div>
                    )}

                    <div className="flex flex-col items-center gap-6 mt-auto">
                      <div className="relative group">
                        <button
                          onClick={() => incrementCounter(currentIndex)}
                          className={`w-32 h-32 rounded-full border-4 transition-all duration-300 flex flex-col items-center justify-center ${(counters[currentIndex] || 0) >= (tabConfig.find(t => t.id === category)?.data[currentIndex]?.repeat)
                            ? "bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/40"
                            : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-90"
                            }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Count</span>
                          <span className="text-4xl font-black">{counters[currentIndex] || 0}</span>
                          <span className="text-[10px] font-bold opacity-60 mt-1">/ {tabConfig.find(t => t.id === category)?.data[currentIndex]?.repeat}</span>
                        </button>

                        {(counters[currentIndex] || 0) >= (tabConfig.find(t => t.id === category)?.data[currentIndex]?.repeat) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 bg-white dark:bg-[#060d0a] text-emerald-500 rounded-full p-1"
                          >
                            <FaCheckCircle className="text-2xl" />
                          </motion.div>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">
                        Tap anywhere or click button to increment
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Completion Modal */}
        <Modal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
        >
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              🎉
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">تقبل الله طاعتكم</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              May Allah accept your good deeds. You have completed this collection.
            </p>
            <div className="space-y-4">
              <button
                onClick={resetAll}
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
              >
                Recite Again
              </button>
              <button
                onClick={() => navigate("/azkar")}
                className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Choose Another collection
              </button>
            </div>
          </div>
        </Modal>

        <PrayerReminderModal
          isOpen={showReminder}
          onClose={() => setShowReminder(false)}
        />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        .font-arabic {
          font-family: 'Amiri', serif;
        }
      `}</style>
    </div>
  );
}

export default Azkar;

