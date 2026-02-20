import React, { useState, useEffect } from "react";
import { FaQuran, FaBars, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
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
    { name: "Home", path: "/" },
    { name: "Quran", path: "/surahs" },
    { name: "Prayer Times", path: "/prayer-times" },
    { name: "Qibla", path: "/qibla" },
    { name: "Khatmah", path: "/khatmah" },
    { name: "Mosques", path: "/find-mosque" },
    { name: "Azkar", path: "/azkar" },
  ];

  return (
    <nav
      className={`fixed w-full top-0 z-[100] transition-all duration-300 ${isScrolled
        ? "py-3 bg-white/80 dark:bg-[#060d0a]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 shadow-sm"
        : "py-5 bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <FaQuran className="text-xl" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-600 dark:from-emerald-300 dark:to-emerald-500 bg-clip-text text-transparent">
              Sci-Code Islamic
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full text-sm font-semibold transition-all relative ${isActive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-4" />

            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white hover:scale-110 active:scale-95 transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FaSun className="w-4 h-4 text-amber-400" />
              ) : (
                <FaMoon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white"
            >
              {darkMode ? <FaSun className="w-4 h-4 text-amber-400" /> : <FaMoon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-[#060d0a] border-b border-slate-200 dark:border-white/5 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `block p-4 rounded-2xl font-bold transition-all ${isActive
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;

