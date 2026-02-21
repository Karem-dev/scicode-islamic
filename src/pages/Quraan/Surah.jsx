import React, { useState, useEffect, useRef } from "react";
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
  FaPlay,
  FaPause,
  FaMinus,
  FaPlus,
  FaCogs,
} from "react-icons/fa";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState("continuous"); // "card" | "continuous"
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const location = useLocation();

  // Auto-scroll
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 1 to 5
  const scrollInterval = useRef(null);

  // Brightness
  const [brightness, setBrightness] = useState(0); // 0 to 0.7 opacity

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

        const lastRead = JSON.parse(localStorage.getItem("islamic_last_read"));
        if (lastRead && lastRead.surahId === id) {
          setShowResumePrompt(true);
          setTimeout(() => setShowResumePrompt(false), 10000);
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchSurah();
  }, [id]);

  // Auto-scroll logic
  useEffect(() => {
    if (isAutoScrolling) {
      scrollInterval.current = setInterval(() => {
        window.scrollBy({ top: scrollSpeed, behavior: 'instant' });
      }, 30);
    } else {
      clearInterval(scrollInterval.current);
    }
    return () => clearInterval(scrollInterval.current);
  }, [isAutoScrolling, scrollSpeed]);

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
      setHighlightedVerse(lastRead.verseNumber);
      setTimeout(() => {
        const element = document.getElementById(`verse-${lastRead.verseNumber}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setShowResumePrompt(false);
        // Clear highlight after animation finishes (longer duration)
        setTimeout(() => setHighlightedVerse(null), 5000);
      }, 500);
    }
  };

  // Handle URL-based highlight (from Surahs page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verseToHighlight = params.get('verse');
    if (verseToHighlight && surah) {
      const vn = parseInt(verseToHighlight);
      const targetPage = Math.ceil(vn / versesPerPage);

      // Navigate to correct page if in card mode
      if (viewMode === "card") {
        setCurrentPage(targetPage);
      }

      setHighlightedVerse(vn);
      setTimeout(() => {
        const element = document.getElementById(`verse-${vn}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Fade out highlight after a longer duration
        setTimeout(() => setHighlightedVerse(null), 5000);
      }, 1000);
    }
  }, [location.search, surah]);

  // Auto-save last read verse on scroll
  useEffect(() => {
    if (!surah) return;

    const updateLastReadOnScroll = () => {
      const verseElements = document.querySelectorAll('[id^="verse-"]');
      let mostVisibleVerseId = null;
      let minDistance = Infinity;

      // Find the verse closest to the top/middle of the viewport
      const threshold = window.innerHeight * 0.3;

      for (const el of verseElements) {
        const rect = el.getBoundingClientRect();
        // If the element is within the target viewing area
        if (rect.top >= 0 && rect.top < window.innerHeight) {
          const distance = Math.abs(rect.top - threshold);
          if (distance < minDistance) {
            minDistance = distance;
            mostVisibleVerseId = el.id.replace('verse-', '');
          }
        }
      }

      if (mostVisibleVerseId) {
        const vn = parseInt(mostVisibleVerseId);
        const saved = JSON.parse(localStorage.getItem("islamic_last_read") || "{}");

        // Update only if changed to prevent redundant writes
        if (saved.verseNumber !== vn || saved.surahId !== id) {
          localStorage.setItem("islamic_last_read", JSON.stringify({
            surahId: id,
            verseNumber: vn,
            surahName: surah.name
          }));
        }
      }
    };

    let scrollTimer;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateLastReadOnScroll, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [surah, id, currentPage, viewMode]);

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
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500 relative">
      <Navbar />

      {/* Brightness Overlay */}
      <div
        className="fixed inset-0 bg-black pointer-events-none z-[9999]"
        style={{ opacity: brightness }}
      />

      <main className="container mx-auto px-3 sm:px-4 pt-24 sm:pt-32 pb-16 sm:pb-20 max-w-4xl" dir="rtl">

        {/* Surah Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-[#0a1611] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 border border-slate-100 dark:border-white/5 shadow-2xl shadow-emerald-500/5 mb-8 sm:mb-12 overflow-hidden"
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
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 dark:text-slate-400 font-medium font-arabic">
                <span className="text-emerald-500">{surah.englishName}</span>
                <span className="opacity-20">•</span>
                <span>{surah.revelationType === "Meccan" ? "مكية" : "مدنية"}</span>
                <span className="opacity-20">•</span>
                <span>{surah.numberOfAyahs} آية</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/surahs")}
                className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm"
              >
                <FaArrowLeft className="text-xs transition-transform group-hover:translate-x-1" />
                <span className="font-bold text-sm text-right">العودة للمصحف</span>
              </button>

              <button
                onClick={toggleCompletion}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm ${isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
              >
                {isCompleted ? "تمت الختمة" : "تحديد كمكتمل"}
                <FaCheckCircle className={isCompleted ? "text-emerald-500" : "text-white/50"} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 mb-8 sm:mb-12 sticky top-16 sm:top-24 z-20">
          <div className="relative flex-1 group w-full">
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
              <FaSearch className="text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder="البحث في الآيات..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pr-12 sm:pr-14 pl-3 sm:pl-6 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] bg-white/80 dark:bg-[#0a1611]/80 backdrop-blur-xl border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-base sm:text-lg shadow-2xl shadow-emerald-500/5 group-focus-within:shadow-emerald-500/10`}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-5 rounded-2xl transition-all shadow-lg ${showSettings ? "bg-emerald-600 text-white" : "bg-white dark:bg-[#0a1611] text-slate-400 border border-slate-100 dark:border-white/5 hover:text-emerald-500"}`}
            >
              <FaCogs className="text-xl" />
            </button>

            {currentSurahBookmarks.length > 0 && (
              <button
                onClick={jumpToLastMark}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
              >
                <FaFlag className="text-sm" />
                <span className="hidden md:inline">آخر علامة</span>
              </button>
            )}
          </div>
        </div>

        {/* Floating Settings Tooltip/Menu */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mb-8 p-6 bg-white dark:bg-[#0a1611] sticky top-[190px] z-20 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-black text-emerald-600/60 dark:text-emerald-400/60 tracking-widest text-center md:text-right">وضع العرض</span>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <button
                      onClick={() => setViewMode("card")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === "card" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hovor:text-emerald-500"}`}
                    >
                      منفصل
                    </button>
                    <button
                      onClick={() => setViewMode("continuous")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === "continuous" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-emerald-500"}`}
                    >
                      مستمر
                    </button>
                  </div>
                </div>

                <div className="w-px h-10 bg-slate-100 dark:bg-white/10 hidden md:block" />

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-black text-emerald-600/60 dark:text-emerald-400/60 tracking-widest text-center md:text-right">التمرير التلقائي</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isAutoScrolling ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-500"}`}
                    >
                      {isAutoScrolling ? <FaPause /> : <FaPlay />}
                    </button>
                    {isAutoScrolling && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                        <button onClick={() => setScrollSpeed(prev => Math.max(1, prev - 1))} className="p-2 hover:text-emerald-500"><FaMinus className="text-xs" /></button>
                        <span className="font-bold text-sm min-w-[2rem] text-center">{scrollSpeed}x</span>
                        <button onClick={() => setScrollSpeed(prev => Math.min(10, prev + 1))} className="p-2 hover:text-emerald-500"><FaPlus className="text-xs" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-px h-px md:h-12 bg-slate-100 dark:bg-white/10" />

              <div className="flex flex-col  gap-2 flex-1 max-w-xs">
                <span className="text-[10px] uppercase font-black text-emerald-600/60 dark:text-emerald-400/60 tracking-widest text-center md:text-right">تعتيم الشاشة (للقراءة الليلية)</span>
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

        {/* Verses Reader */}
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {viewMode === "card" ? (
              currentVerses?.map((verse, idx) => (
                <motion.div
                  key={verse.numberInSurah}
                  id={`verse-${verse.numberInSurah}`}
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`group relative bg-white dark:bg-[#0a1611] rounded-[2rem] sm:rounded-[3rem] border p-6 sm:p-12 md:p-16 hover:border-emerald-500/30 transition-all duration-500 ${currentSurahBookmarks.includes(verse.numberInSurah)
                    ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-500/5 shadow-2xl shadow-emerald-500/10"
                    : "border-slate-100 dark:border-white/5"
                    } ${highlightedVerse === verse.numberInSurah ? 'verse-pulse-highlighter' : ''}`}
                >
                  <div className="absolute top-10 right-10 left-10 flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-emerald-500/10 flex items-center justify-center text-slate-400 dark:text-emerald-400 font-black text-sm border border-slate-100 dark:border-white/5 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        {verse.numberInSurah}
                      </div>
                      <button
                        onClick={() => toggleBookmark(verse.numberInSurah)}
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border ${currentSurahBookmarks.includes(verse.numberInSurah)
                          ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/20"
                          : "bg-white dark:bg-white/5 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-white/5 hover:text-emerald-500 hover:border-emerald-500/30"
                          }`}
                      >
                        {currentSurahBookmarks.includes(verse.numberInSurah) ? <FaBookmark /> : <FaRegBookmark />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right pt-10 sm:pt-12">
                    <p
                      className="leading-[2.2] sm:leading-[2.5] md:leading-[3] text-slate-800 dark:text-white font-arabic text-2xl sm:text-3xl md:text-5xl select-all px-2 sm:px-4"
                    >
                      {verse.text}
                      <span className="inline-block mx-6 text-emerald-500/30 text-3xl font-normal">﴿{verse.numberInSurah}﴾</span>
                    </p>
                  </div>

                  {verse.sajda && (
                    <div className="mt-10 mr-4 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-500/10">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      موضع سجدة
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#0a1611] rounded-[2rem] sm:rounded-[3.5rem] border border-slate-100 dark:border-white/5 p-8 sm:p-16 md:p-24 shadow-2xl relative"
              >
                <div className="text-right">
                  {/* Basmalah for all surahs except 1 and 9 */}
                  {id !== "1" && id !== "9" && (
                    <div className="text-center mb-16 text-4xl md:text-6xl font-arabic text-slate-900 dark:text-white">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                  )}
                  <p className="leading-[2.8] md:leading-[4.2] text-slate-800 dark:text-white font-arabic text-2xl sm:text-3xl md:text-5xl text-justify" style={{ direction: 'rtl' }}>
                    {surah.ayahs.map((ayah, i) => {
                      // Remove Basmalah if it's prefixed in the first ayah (common in some APIs)
                      let text = ayah.text;
                      if (i === 0 && id !== "1" && id !== "9" && text.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ")) {
                        text = text.replace("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ", "");
                      }
                      return (
                        <React.Fragment key={ayah.numberInSurah}>
                          <span
                            id={`verse-${ayah.numberInSurah}`}
                            onClick={() => toggleBookmark(ayah.numberInSurah)}
                            className={`cursor-pointer transition-colors duration-300 ${currentSurahBookmarks.includes(ayah.numberInSurah) ? 'text-emerald-500' : 'hover:text-emerald-500/70'} ${highlightedVerse === ayah.numberInSurah ? 'verse-pulse-highlighter-text rounded-lg px-1' : ''}`}
                          >
                            {text}
                          </span>
                          <span className="inline-block mx-3 text-emerald-500/40 text-[0.7em] font-normal select-none">
                            ﴿{ayah.numberInSurah}﴾
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Premium Pagination */}
        {viewMode === "card" && filteredVerses?.length > versesPerPage && (
          <div className="flex justify-center mt-20">
            <nav className="flex items-center gap-2 p-2.5 bg-white/80 dark:bg-[#0a1611]/80 backdrop-blur-xl rounded-full border border-slate-100 dark:border-white/5 shadow-2xl shadow-emerald-500/5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-4 rounded-full text-slate-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              >
                <FaChevronRight className="rotate-180" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {getPageNumbers().map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`w-11 h-11 rounded-full font-black text-sm transition-all ${currentPage === number
                      ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/40 scale-110"
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
                className="p-4 rounded-full text-slate-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
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
            initial={{ opacity: 0, y: 100, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 100, x: 20 }}
            className="fixed bottom-10 right-10 z-[100] max-w-sm w-full"
          >
            <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/40 relative overflow-hidden group border border-emerald-400/30 backdrop-blur-md">
              <div className="absolute -top-10 -left-10 p-12 opacity-10 pointer-events-none rotate-12 transition-transform group-hover:scale-110">
                <FaHistory className="text-9xl" />
              </div>
              <h4 className="font-bold text-xl mb-3 flex items-center gap-3">
                <FaFlag className="text-sm" /> هل تود المتابعة؟
              </h4>
              <p className="text-emerald-50 text-sm mb-8 leading-relaxed font-medium">
                لقد توقفت عند الآية رقم <span className="font-black underline decoration-2 underline-offset-4"># {JSON.parse(localStorage.getItem("islamic_last_read"))?.verseNumber}</span>. هل تريد العودة مباشرة إلى هناك؟
              </p>
              <div className="flex gap-4">
                <button
                  onClick={resumeReading}
                  className="flex-1 py-4 bg-white text-emerald-600 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-all shadow-xl active:scale-95"
                >
                  نعم، تابع القراءة
                </button>
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="px-6 py-4 bg-emerald-700/50 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all border border-white/10"
                >
                  لاحقاً
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

        @keyframes pulse-highlight {
          0%, 100% { background-color: transparent; }
          5%, 15%, 25%, 35%, 45%, 55%, 65%, 75%, 85%, 95% { background-color: rgba(16, 185, 129, 0.65); }
          10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% { background-color: transparent; }
        }

        .verse-pulse-highlighter {
          animation: pulse-highlight 10s ease-in-out;
        }

        .verse-pulse-highlighter-text {
          animation: pulse-highlight 10s ease-in-out;
          display: inline-block;
          border-radius: 12px;
          padding: 0 6px;
        }
      `}</style>
    </div>
  );
}

export default Surah;


