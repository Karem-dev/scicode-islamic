import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaLightbulb,
  FaBookmark,
  FaRegBookmark,
  FaFlag,
  FaCheckCircle,
  FaHistory,
  FaFolder,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import axios from "axios";

function Surah() {
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("islamic_bookmarks");
    return saved ? JSON.parse(saved) : {};
  });
  const [completedSurahs, setCompletedSurahs] = useState(() => {
    const saved = localStorage.getItem("islamic_completed_surahs");
    return saved ? JSON.parse(saved) : [];
  });

  const versesPerPage = 10;

  useEffect(() => {
    const fetchSurah = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.alquran.cloud/v1/surah/${id}/quran-uthmani`
        );
        setSurah(response.data.data);
        setLoading(false);

        // Check for resume point
        const lastRead = JSON.parse(localStorage.getItem("islamic_last_read"));
        if (lastRead && lastRead.surahId === id) {
          setShowResumePrompt(true);
          // Hide after 10 seconds automatically
          setTimeout(() => setShowResumePrompt(false), 10000);
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchSurah();
  }, [id]);

  useEffect(() => {
    localStorage.setItem("islamic_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("islamic_completed_surahs", JSON.stringify(completedSurahs));
  }, [completedSurahs]);

  const toggleBookmark = (verseNumber) => {
    setBookmarks(prev => {
      const currentSurahBookmarks = prev[id] || [];
      const isBookmarked = currentSurahBookmarks.includes(verseNumber);

      const newBookmarks = {
        ...prev,
        [id]: isBookmarked
          ? currentSurahBookmarks.filter(v => v !== verseNumber)
          : [...currentSurahBookmarks, verseNumber]
      };

      // Save as last read position if bookmarked
      if (!isBookmarked) {
        localStorage.setItem("islamic_last_read", JSON.stringify({
          surahId: id,
          verseNumber: verseNumber,
          surahName: surah.name
        }));
      }

      return newBookmarks;
    });
  };

  const toggleCompletion = () => {
    const numId = parseInt(id);
    setCompletedSurahs(prev =>
      prev.includes(numId)
        ? prev.filter(n => n !== numId)
        : [...prev, numId]
    );
  };

  const jumpToLastMark = () => {
    const currentSurahBookmarks = bookmarks[id] || [];
    if (currentSurahBookmarks.length > 0) {
      const lastVerse = Math.max(...currentSurahBookmarks);
      const targetPage = Math.ceil(lastVerse / versesPerPage);
      handlePageChange(targetPage);
      setTimeout(() => {
        const element = document.getElementById(`verse-${lastVerse}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  };

  const resumeReading = () => {
    const lastRead = JSON.parse(localStorage.getItem("islamic_last_read"));
    if (lastRead && lastRead.surahId === id) {
      const targetPage = Math.ceil(lastRead.verseNumber / versesPerPage);
      handlePageChange(targetPage);
      setTimeout(() => {
        const element = document.getElementById(`verse-${lastRead.verseNumber}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setShowResumePrompt(false);
      }, 500);
    }
  };

  const filteredVerses = surah?.ayahs?.filter((ayah) =>
    ayah.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastVerse = currentPage * versesPerPage;
  const indexOfFirstVerse = indexOfLastVerse - versesPerPage;
  const currentVerses = filteredVerses?.slice(indexOfFirstVerse, indexOfLastVerse);
  const totalPages = Math.ceil((filteredVerses?.length || 0) / versesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + 4);
      if (end === totalPages) start = Math.max(1, end - 4);
      for (let i = start; i <= end; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const currentSurahBookmarks = bookmarks[id] || [];
  const isCompleted = completedSurahs.includes(parseInt(id));

  return (
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-4xl" dir="rtl">

        {/* Surah Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-[#0a1611] rounded-[3rem] p-10 md:p-16 border border-slate-100 dark:border-white/5 shadow-2xl shadow-emerald-500/5 mb-12 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  Surah #{surah.number}
                </div>
                {isCompleted && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest">
                    <FaCheckCircle className="text-[10px]" /> Completed
                  </div>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-arabic font-bold text-slate-900 dark:text-white mb-4">
                {surah.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 dark:text-slate-400 font-medium">
                <span className="text-emerald-500">{surah.englishName}</span>
                <span className="opacity-20">•</span>
                <span>{surah.revelationType}</span>
                <span className="opacity-20">•</span>
                <span>{surah.numberOfAyahs} Verses</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/surahs")}
                className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm"
              >
                <FaArrowLeft className="text-xs transition-transform group-hover:translate-x-1" />
                <span className="font-bold text-sm text-right">Return to Quran</span>
              </button>

              <button
                onClick={toggleCompletion}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm ${isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
              >
                {isCompleted ? "Completed" : "Mark as Completed"}
                <FaCheckCircle className={isCompleted ? "text-emerald-500" : "text-white/50"} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="relative flex-1 group w-full">
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
              <FaSearch className="text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder="Search verses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pr-14 pl-6 py-4 rounded-[1.5rem] bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            {currentSurahBookmarks.length > 0 && (
              <button
                onClick={jumpToLastMark}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
              >
                <FaFlag className="text-xs" />
                <span>Jump to Last Mark</span>
              </button>
            )}
            <button className="p-4 rounded-2xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 text-slate-400 hover:text-emerald-500 transition-colors shadow-sm">
              <FaLightbulb />
            </button>
            <button className="p-4 rounded-2xl bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-white/5 text-slate-400 hover:text-emerald-500 transition-colors shadow-sm">
              <FaSync />
            </button>
          </div>
        </div>

        {/* Verses Reader */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {currentVerses?.map((verse, idx) => (
              <motion.div
                key={verse.numberInSurah}
                id={`verse-${verse.numberInSurah}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative bg-white dark:bg-[#0a1611] rounded-[2.5rem] border p-10 md:p-14 hover:border-emerald-500/30 transition-all duration-500 ${currentSurahBookmarks.includes(verse.numberInSurah)
                  ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-500/5 shadow-lg shadow-emerald-500/5"
                  : "border-slate-100 dark:border-white/5"
                  }`}
              >
                <div className="absolute top-8 left-8 flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(verse.numberInSurah)}
                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${currentSurahBookmarks.includes(verse.numberInSurah)
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-slate-50 dark:bg-emerald-500/10 text-slate-400 dark:text-emerald-500/60 hover:text-emerald-600"
                      }`}
                  >
                    {currentSurahBookmarks.includes(verse.numberInSurah) ? <FaBookmark /> : <FaRegBookmark />}
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-emerald-500/10 flex items-center justify-center text-slate-400 dark:text-emerald-500/60 font-bold text-xs">
                    {verse.numberInSurah}
                  </div>
                </div>

                <div className="text-center md:text-right pt-6">
                  <p
                    className="leading-[2.2] md:leading-[2.8] text-slate-800 dark:text-white font-arabic text-3xl md:text-5xl select-all"
                  >
                    {verse.text}
                    <span className="inline-block mx-4 text-emerald-500/40 text-2xl">﴿{verse.numberInSurah}﴾</span>
                  </p>
                </div>

                {verse.sajda && (
                  <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                    Prostration Verse
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Premium Pagination */}
        {filteredVerses?.length > versesPerPage && (
          <div className="flex justify-center mt-20">
            <nav className="flex items-center gap-2 p-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-full border border-slate-100 dark:border-white/5 shadow-sm">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-full text-slate-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              >
                <FaChevronRight className="rotate-180" />
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${currentPage === number
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110"
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
                <FaChevronRight />
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* Resume Promotion Alert */}
      <AnimatePresence>
        {showResumePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 left-10 z-50 max-w-sm w-full"
          >
            <div className="bg-emerald-600 text-white p-6 rounded-[2rem] shadow-2xl shadow-emerald-500/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none rotate-12 transition-transform group-hover:scale-110">
                <FaHistory className="text-8xl" />
              </div>
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                <FaFlag className="text-xs" /> Continue Reading?
              </h4>
              <p className="text-emerald-50 text-sm mb-6 leading-relaxed">
                We noticed you were reading verse <span className="font-bold"># {JSON.parse(localStorage.getItem("islamic_last_read"))?.verseNumber}</span> last time. Want to jump straight back?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={resumeReading}
                  className="flex-1 py-3 bg-white text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg"
                >
                  Resume Now
                </button>
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors border border-white/10"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap');
        .font-arabic { 
          font-family: 'Scheherazade New', serif;
          word-spacing: 0.15em;
        }
      `}</style>
    </div>
  );
}

export default Surah;


