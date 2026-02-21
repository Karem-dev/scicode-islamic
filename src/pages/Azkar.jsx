import React, { useState, useEffect } from "react";
import {
  FaSun,
  FaMoon,
  FaPray,
  FaArrowLeft,
  FaCheckCircle,
  FaUndo,
  FaExternalLinkAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCogs,
  FaLightbulb,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PrayerReminderModal from "../components/PrayerReminderModal";
import Modal from "../components/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

function Azkar() {
  const { t, lang } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counters, setCounters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { category: activeCategoryName } = useParams();
  const [showReminder, setShowReminder] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings
  const [brightness, setBrightness] = useState(0);

  // Pagination for Azkar items
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(1);

  // Pagination for Azkar Categories
  const [catPage, setCatPage] = useState(1);
  const catsPerPage = 12;

  useEffect(() => {
    const fetchAzkar = async () => {
      try {
        const response = await axios.get("https://raw.githubusercontent.com/osamayy/azkar-db/master/azkar.json");
        const rows = response.data.rows || [];

        const grouped = rows.reduce((acc, row) => {
          const catName = row[0];
          if (row[1] && row[1].trim() !== '') {
            if (!acc[catName]) acc[catName] = [];
            acc[catName].push({
              zekr: row[1],
              bless: row[2],
              repeat: parseInt(row[3]) || 1,
              reference: row[4]
            });
          }
          return acc;
        }, {});

        const cats = Object.keys(grouped).filter(name => grouped[name].length > 0).map((name, index) => ({
          id: name,
          nameAr: name,
          data: grouped[name],
          color: index % 3 === 0 ? "from-emerald-400 to-teal-600" : index % 3 === 1 ? "from-amber-400 to-orange-500" : "from-indigo-400 to-purple-600",
          icon: index % 3 === 0 ? <FaPray /> : index % 3 === 1 ? <FaSun /> : <FaMoon />
        }));

        setCategories(cats);
        setLoading(false);
      } catch (error) {
        setError("Error loading Azkar. Please check your connection.");
        setLoading(false);
      }
    };
    fetchAzkar();
  }, []);

  useEffect(() => {
    // Automatically close modals and reset view settings when the category changes
    setShowCompletionModal(false);
    setShowSettings(false);

    if (!activeCategoryName) {
      const timer = setTimeout(() => setShowReminder(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Reset progress when entering a new category
      setCounters({});
      setCurrentPage(1);
    }
  }, [activeCategoryName]);

  const currentCategory = categories.find(c => c.id === activeCategoryName);

  const incrementCounter = (idx) => {
    if (!currentCategory) return;

    const target = currentCategory.data[idx].repeat;
    const current = counters[idx] || 0;

    if (current >= target) return;

    const nextValue = current + 1;
    setCounters((prev) => ({ ...prev, [idx]: nextValue }));

    if (nextValue >= target) {
      if (idx + 1 < currentCategory.data.length) {
        if (itemsPerPage === 1) {
          setTimeout(() => setCurrentPage(idx + 2), 400);
        }
      } else {
        setTimeout(() => setShowCompletionModal(true), 600);
      }
    }
  };

  const resetAll = () => {
    setCounters({});
    setCurrentPage(1);
    setShowCompletionModal(false);
  };

  const filteredCategories = categories.filter(c =>
    c.nameAr.includes(searchQuery)
  );

  const totalCatPages = Math.ceil(filteredCategories.length / catsPerPage);
  const currentCats = filteredCategories.slice((catPage - 1) * catsPerPage, catPage * catsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentCategory?.data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = currentCategory ? Math.ceil(currentCategory.data.length / itemsPerPage) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500 relative">
      <Navbar />

      {/* Brightness Overlay */}
      <div
        className="fixed inset-0 bg-black pointer-events-none z-[9999]"
        style={{ opacity: brightness }}
      />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-6xl">
        {!activeCategoryName ? (
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6">
                {lang === 'ar' ? <>حصن <span className="text-emerald-600">المسلم</span></> : t.azkarTitle}
              </h1>
              <p className="text-slate-500 dark:text-emerald-500/60 font-medium text-xl">{t.azkarSubtitle}</p>

              <div className="mt-10 max-w-xl mx-auto relative group">
                <FaSearch className={`absolute ${lang === 'ar' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors`} />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${lang === 'ar' ? 'pr-16 pl-6 text-right' : 'pl-16 pr-6 text-left'} py-5 rounded-3xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg dark:text-white`}
                />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {currentCats.map((tab) => (
                <motion.div
                  key={tab.id}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1 }
                  }}
                >
                  <button
                    onClick={() => navigate(`/azkar/${tab.id}`)}
                    className={`w-full ${lang === 'ar' ? 'text-right items-end' : 'text-left items-start'} group p-6 rounded-[2rem] bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 flex flex-col`}
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tab.color} flex items-center justify-center text-white text-xl mb-4 shadow-inner group-hover:scale-110 transition-transform`}>
                      {tab.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{tab.nameAr}</h3>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest">
                      {tab.data.length} {t.remembrances} <FaExternalLinkAlt className="text-[10px]" />
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>

            {totalCatPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  disabled={catPage === 1}
                  onClick={() => setCatPage(prev => prev - 1)}
                  className="p-4 rounded-xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 disabled:opacity-30 text-emerald-600 shadow-sm transition-all hover:scale-105"
                >
                  <FaChevronLeft className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
                <div className="px-6 py-2 rounded-xl bg-emerald-600/5 dark:bg-emerald-500/10 text-emerald-600 font-black text-sm tracking-widest uppercase">
                  {catPage} / {totalCatPages}
                </div>
                <button
                  disabled={catPage === totalCatPages}
                  onClick={() => setCatPage(prev => prev + 1)}
                  className="p-4 rounded-xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 disabled:opacity-30 text-emerald-600 shadow-sm transition-all hover:scale-105"
                >
                  <FaChevronRight className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex rotate-180 md:rotate-0 flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/azkar")}
                    className="p-4 rounded-2xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 text-slate-500 hover:text-emerald-600 transition-colors shadow-sm"
                  >
                    <FaArrowLeft className={lang === 'ar' ? "rotate-0" : "rotate-180"} />
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-4 rounded-2xl transition-all shadow-sm ${showSettings ? "bg-emerald-600 text-white" : "bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 text-slate-500 hover:text-emerald-600"}`}
                  >
                    <FaCogs />
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold dark:text-white tracking-widest text-emerald-600 font-arabic">
                    {currentCategory?.nameAr}
                  </h2>
                  <div className="flex gap-1.5 mt-3">
                    {currentCategory?.data.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentPage - 1 ? "w-8 bg-emerald-500" : i < currentPage - 1 ? "w-2 bg-emerald-700/50" : "w-1.5 bg-slate-200 dark:bg-white/10"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={resetAll}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 text-slate-500 hover:text-orange-500 transition-colors shadow-sm"
                  title={t.reset}
                >
                  <FaUndo className="text-sm" />
                </button>
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6 bg-white dark:bg-[#0a1611] rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-2xl flex items-center justify-center gap-8"
                  >
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      <span className="text-[10px] uppercase font-black text-emerald-600/60 dark:text-emerald-400/60 tracking-widest text-center">تعتيم الشاشة</span>
                      <div className="flex items-center gap-4">
                        <FaLightbulb className="text-slate-400" />
                        <input
                          type="range"
                          min="0"
                          max="0.8"
                          step="0.1"
                          value={brightness}
                          onChange={(e) => setBrightness(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <FaLightbulb className="text-emerald-500" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="relative"
                >
                  {currentItems?.map((item, idx) => {
                    const globalIdx = indexOfFirstItem + idx;
                    return (
                      <div key={globalIdx} className="bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-12 md:p-24 shadow-2xl shadow-emerald-500/5 min-h-[500px] flex flex-col items-center justify-center text-center group">

                        <div className="max-h-[350px] overflow-y-auto scrollbar-hide w-full px-4 mb-12">
                          <p
                            className="text-3xl md:text-5xl font-arabic leading-[1.8] md:leading-[2.2] dark:text-white select-none cursor-pointer active:scale-[0.99] transition-transform"
                            onClick={() => incrementCounter(globalIdx)}
                          >
                            {item.zekr}
                          </p>
                        </div>

                        {item.bless && (
                          <div className="max-w-md p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 text-lg italic mb-12 border border-emerald-100 dark:border-emerald-500/10 font-arabic">
                            {item.bless}
                          </div>
                        )}

                        <div className="flex flex-col items-center gap-8 mt-auto">
                          <button
                            onClick={() => incrementCounter(globalIdx)}
                            className={`w-40 h-40 rounded-full border-4 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${(counters[globalIdx] || 0) >= (item.repeat)
                              ? "bg-emerald-600 border-emerald-400 text-white shadow-2xl shadow-emerald-600/40"
                              : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:scale-105 hover:bg-emerald-100/50"
                              }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60 font-arabic">{t.count}</span>
                            <span className="text-6xl font-black">{counters[globalIdx] || 0}</span>
                            <span className="text-sm font-bold opacity-60 mt-2 font-arabic">/ {item.repeat}</span>
                          </button>

                          {(counters[globalIdx] || 0) >= (item.repeat) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-emerald-500 flex items-center gap-2 font-black text-xl font-arabic"
                            >
                              <FaCheckCircle /> {globalIdx + 1 < currentCategory.data.length ? "..." : t.done}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-4 rounded-xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 disabled:opacity-30 text-emerald-600 shadow-sm transition-all hover:scale-105"
                >
                  <FaChevronLeft className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
                <div className="px-6 py-2 rounded-xl bg-emerald-600/5 dark:bg-emerald-500/10 text-emerald-600 font-black text-sm tracking-widest uppercase">
                  {currentPage} / {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-4 rounded-xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 disabled:opacity-30 text-emerald-600 shadow-sm transition-all hover:scale-105"
                >
                  <FaChevronRight className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <Modal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)}>
          <div className="text-center p-12">
            <div className="w-28 h-28 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 text-6xl">🎉</div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 font-arabic">{t.done}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-xl font-arabic">{t.completedMsg}</p>
            <div className="flex flex-col gap-4">
              <button onClick={resetAll} className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-bold text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 font-arabic">{t.reciteAgain}</button>
              <button onClick={() => { setShowCompletionModal(false); navigate("/azkar"); }} className="w-full py-5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white font-bold text-xl hover:bg-slate-200 transition-all font-arabic">{t.chooseAnother}</button>
            </div>
          </div>
        </Modal>

        <PrayerReminderModal isOpen={showReminder} onClose={() => setShowReminder(false)} />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        .font-arabic { font-family: 'Amiri', serif; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

export default Azkar;
