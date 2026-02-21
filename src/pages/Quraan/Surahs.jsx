import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaMosque,
  FaSun,
  FaStar,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import Modal from "../../components/Modal";
import { FaHistory, FaFlag } from "react-icons/fa";

function Surahs() {
  const { t, lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [lastRead, setLastRead] = useState(null);
  const navigate = useNavigate();
  const surahsPerPage = 12;

  useEffect(() => {
    const fetchSurahs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://api.alquran.cloud/v1/quran/quran-uthmani"
        );
        setSurahs(response.data.data.surahs);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchSurahs();

    // Check for last read surah
    const savedLastRead = localStorage.getItem("islamic_last_read");
    if (savedLastRead) {
      setLastRead(JSON.parse(savedLastRead));
      setTimeout(() => setShowResumeModal(true), 1500);
    }
  }, []);

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishNameTranslation
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const indexOfLastSurah = currentPage * surahsPerPage;
  const indexOfFirstSurah = indexOfLastSurah - surahsPerPage;
  const currentSurahs = filteredSurahs.slice(
    indexOfFirstSurah,
    indexOfLastSurah
  );
  const totalPages = Math.ceil(filteredSurahs.length / surahsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-20 max-w-6xl">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-5">
            <FaStar className="text-[10px]" />
            {t.quran}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 px-2">
            {t.quranTitle}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed px-4">
            {t.quranSubtitle}
          </p>
        </motion.div>

        {/* Search Experience */}
        <div className="max-w-xl mx-auto mb-10 sm:mb-16 sticky top-20 sm:top-24 z-20 px-2">
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-2xl group-hover:bg-emerald-500/15 transition-all duration-300" />
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-6 sm:px-8 py-4 sm:py-5 ${lang === 'ar' ? 'pr-12 sm:pr-16 text-right' : 'pl-12 sm:pl-16 text-left'} rounded-[2rem] bg-white/80 dark:bg-[#0a1611]/80 backdrop-blur-xl border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xl shadow-emerald-500/5 group-focus-within:shadow-emerald-500/10 text-base sm:text-lg`}
              />
              <FaSearch className={`absolute ${lang === 'ar' ? 'right-5 sm:right-6' : 'left-5 sm:left-6'} text-emerald-500 transition-transform group-hover:scale-110`} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-emerald-600/60 font-medium">{t.loading}...</p>
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-red-50 dark:bg-red-500/5 rounded-[2.5rem] border border-red-100 dark:border-red-500/10">
            <p className="text-red-600 dark:text-red-400 font-bold mb-2">{t.error}</p>
            <p className="text-red-500/60 text-sm">We couldn't reach the celestial library. Please try again later.</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {currentSurahs.map((surah) => (
                <motion.div key={surah.number} variants={itemVariants}>
                  <Link
                    to={`/surah/${surah.number}`}
                    className="group flex flex-col h-full bg-white dark:bg-[#0a1611] rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden"
                  >
                    <div className="p-6 sm:p-8 pb-3 sm:pb-4">
                      <div className="flex justify-between items-start mb-5 sm:mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-base sm:text-lg group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 flex-shrink-0">
                          {surah.number}
                        </div>
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-arabic font-bold text-slate-900 dark:text-white mb-1">
                            {surah.name}
                          </p>
                          <p className="text-xs font-bold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest">
                            {surah.revelationType}
                          </p>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {surah.englishName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {surah.englishNameTranslation}
                      </p>
                    </div>

                    <div className="mt-auto p-6 sm:p-8 pt-0">
                      <div className="flex items-center gap-4 pt-5 sm:pt-6 border-t border-slate-50 dark:border-white/5">
                        <div className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500">
                          <FaSun className={`text-emerald-500/50 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          {surah.ayahs.length} {t.verses}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                          {surah.revelationType === "Meccan" ? <FaMosque className={`text-emerald-500/50 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`} /> : <FaMosque className={`text-teal-500/50 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`} />}
                          {t.revelation}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Premium Pagination */}
            {filteredSurahs.length > surahsPerPage && (
              <div className="flex justify-center mt-20">
                <nav className="flex items-center gap-2 p-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-full border border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 rounded-full text-slate-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <FaChevronLeft className={lang === 'ar' ? 'rotate-180' : ''} />
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((number) => (
                      <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${currentPage === number
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 grow-0 scale-110"
                          : "text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-white/5"
                          }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-full text-slate-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <FaChevronRight className={lang === 'ar' ? 'rotate-180' : ''} />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>

      <Modal isOpen={showResumeModal} onClose={() => setShowResumeModal(false)}>
        <div className="p-8 sm:p-12 text-center relative overflow-hidden group" dir="rtl">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform">
            <FaHistory className="text-[12rem] text-emerald-500" />
          </div>

          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-white/5 shadow-xl shadow-emerald-500/5">
            <FaFlag className="text-3xl" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 font-arabic">
            هل تود المتابعة؟
          </h2>

          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed max-w-sm mx-auto font-arabic">
            لقد توقفت عند <span className="font-bold text-emerald-600 dark:text-emerald-400">سورة {lastRead?.surahName}</span> (الآية #{lastRead?.verseNumber}). هل تريد العودة مباشرة إلى هناك؟
          </p>

          <div className="flex flex-col sm:flex-row-reverse gap-4 items-stretch sm:items-center">
            <button
              onClick={() => {
                setShowResumeModal(false);
                navigate(`/surah/${lastRead?.surahId}?verse=${lastRead?.verseNumber}`);
              }}
              className="flex-1 py-5 rounded-[1.5rem] bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 font-arabic"
            >
              نعم، تابع القراءة
            </button>
            <button
              onClick={() => setShowResumeModal(false)}
              className="px-8 py-5 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 font-arabic"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        .font-arabic { font-family: 'Amiri', serif; }
      `}</style>
    </div>
  );
}

export default Surahs;

