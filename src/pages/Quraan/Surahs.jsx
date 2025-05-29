import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaBookmark,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { Link } from "react-router-dom";

function Surahs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-emerald-800 dark:text-emerald-300 mb-4">
              The Holy Quran
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore the divine revelations of Allah through the 114 surahs of
              the Holy Quran
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search surahs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 dark:text-gray-300">
                Loading surahs...
              </div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-600 dark:text-red-400 mb-8">
              Error loading surahs. Please try again later.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSurahs.map((surah) => (
              <Link to={`/surah/${surah.number}`}
                key={surah.number}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 leading-snug">
                        {surah.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {surah.englishName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg text-white  mb-1 flex items-center justify-center w-10 h-10  bg-emerald-600 dark:bg-emerald-500 rounded-full">
                        {surah.number}

                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Translation:{" "}
                      </span>
                      {surah.englishNameTranslation}
                    </span>
                    <span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Revelation Type:{" "}
                      </span>
                      {surah.revelationType}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/30 px-5 py-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Number of Verses:{" "}
                    <span className="font-semibold">{surah.ayahs.length}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {!loading && !error && filteredSurahs.length > 0 && (
            <div className="flex justify-center mt-10">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  }`}
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === number
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  }`}
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Surahs;
