import React, { useState } from "react";
import { FaQuran, FaBars, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { Link, NavLink } from "react-router-dom";
import FindMosque from "./../pages/FindMosque";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg fixed w-full top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <FaQuran className="text-emerald-600 dark:text-emerald-400 text-2xl mr-2" />
            <Link
              to={"/"}
              className="text-xl font-bold text-emerald-800 dark:text-emerald-300"
            >
              Sci-Code Islamic
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to={"/"}
              className="text-black dark:text-white hover:text-emerald-800 dark:hover:text-emerald-300 font-medium"
            >
              Home
            </NavLink>
            <NavLink
              to={"/surahs"}
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
            >
              Quran
            </NavLink>
            <NavLink
              to={"/prayer-times"}
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
            >
              Prayer Times
            </NavLink>
            <NavLink
              to={"/find-mosque"}
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
            >
              Mosques
            </NavLink>
            <NavLink
              to={"/azkar"}
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
            >
              azkar
            </NavLink>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FaSun className="h-5 w-5 text-yellow-500" />
              ) : (
                <FaMoon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Dark Mode Toggle for Mobile */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FaSun className="h-5 w-5 text-yellow-500" />
              ) : (
                <FaMoon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none"
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink
                to={"/"}
                className="block px-3 py-2 text-emerald-600 dark:text-emerald-400 font-medium"
              >
                Home
              </NavLink>
              <NavLink
                to={"/surahs"}
                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
              >
                Quran
              </NavLink>
              <NavLink
                to={"/prayer-times"}
                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
              >
                Prayer Times
              </NavLink>
              <NavLink
                to={"/find-mosque"}
                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
              >
                Mosques
              </NavLink>
              <NavLink
                to={"/azkar"}
                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
              >
                Azkar
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
