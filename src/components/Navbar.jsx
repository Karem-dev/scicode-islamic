import React, { useState, useEffect } from "react";
import { FaQuran, FaBars, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, lang, toggleLanguage } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: t.home, path: "/" },
    { name: t.quran, path: "/surahs" },
    { name: t.prayers, path: "/prayer-times" },
    { name: t.khatmah, path: "/khatmah" },
    { name: t.mosques, path: "/find-mosque" },
    { name: t.azkar, path: "/azkar" },
    { name: t.app, path: "/download" },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-[100] transition-all duration-500 ${isScrolled
        ? "py-3 glass shadow-lg shadow-emerald-500/5 backdrop-blur-2xl"
        : "py-6 bg-transparent"
        }`}
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-4 group"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "anticipate" }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50"
            >
              <FaQuran className="text-2xl" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-emerald-400 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-teal-500 transition-all duration-300">
                {t.appName}
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-600/80 dark:text-emerald-400/80 uppercase">
                {t.faithTech}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1 p-1.5 bg-slate-100/50 dark:bg-white/5 rounded-full backdrop-blur-md border border-slate-200/50 dark:border-white/10">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-6 py-2.5 rounded-full text-[13px] font-bold transition-all relative group ${isActive
                      ? "text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <motion.span
                        className="relative z-10"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {link.name}
                      </motion.span>
                      {isActive && (
                        <motion.div
                          layoutId="navPill"
                          className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full z-0 shadow-lg shadow-emerald-500/30"
                          transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-4" />

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className="px-5 py-2.5 rounded-2xl bg-white dark:bg-white/5 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-white/10 text-xs font-black tracking-widest uppercase hover:shadow-xl hover:shadow-emerald-500/10 transition-all"
              >
                {lang === "ar" ? "EN" : "عربي"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="p-3 rounded-2xl bg-white dark:bg-white/5 text-slate-600 dark:text-white border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FaSun className="w-5 h-5 text-amber-400" />
                ) : (
                  <FaMoon className="w-5 h-5 text-indigo-400" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleLanguage}
              className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs"
            >
              {lang === "ar" ? "EN" : "عربي"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white"
            >
              {darkMode ? <FaSun className="w-4 h-4 text-amber-400" /> : <FaMoon className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="lg:hidden fixed inset-x-4 top-24 z-[99] bg-white/95 dark:bg-[#0a1611]/95 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 gap-3">
              {navLinks.map((link, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={link.path}
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between p-5 rounded-3xl font-bold transition-all ${isActive
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-white/5"
                      }`
                    }
                  >
                    <span>{link.name}</span>
                    <FaQuran className="opacity-20 text-sm" />
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;


