import React, { useState, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaBookmark,
  FaShare,
  FaArrowLeft,
  FaVolumeUp,
  FaVolumeMute,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
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
  const versesPerPage = 15;

  useEffect(() => {
    const fetchSurah = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.alquran.cloud/v1/surah/${id}/quran-uthmani`
        );
        setSurah(response.data.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchSurah();
  }, [id]);

  // Filter verses based on search query
  const filteredVerses = surah?.ayahs?.filter((ayah) =>
    ayah.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastVerse = currentPage * versesPerPage;
  const indexOfFirstVerse = indexOfLastVerse - versesPerPage;
  const currentVerses = filteredVerses?.slice(
    indexOfFirstVerse,
    indexOfLastVerse
  );
  const totalPages = Math.ceil((filteredVerses?.length || 0) / versesPerPage);

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
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center dark:bg-gray-900 h-screen">
        <div className="text-gray-600 dark:text-gray-300">Loading surah...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400">
        Error loading surah. Please try again later.
      </div>
    );
  }

  if (!surah) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
        <div className="container mx-auto px-4">
          {/* Surah Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-4"
              >
                <FaArrowLeft className="text-emerald-600 dark:text-emerald-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-300">
                  {surah.name}
                </h1>
                <p className="text-4xl font-arabic text-gray-700 dark:text-gray-300 mt-2">
                  {surah.englishName}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{surah.englishNameTranslation}</span>
              <span>•</span>
              <span>{surah.numberOfAyahs} Verses</span>
              <span>•</span>
              <span>{surah.revelationType}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search verses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Found {filteredVerses.length} verses matching "{searchQuery}"
              </p>
            )}
          </div>

          {/* Verses List */}
          <div className="max-w-8xl mx-auto space-y-8">
            {currentVerses.map((verse) => (
              <div
                key={verse.numberInSurah}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <div className="p-8">
                  {/* Verse Number and Controls */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-medium text-lg">
                        {verse.numberInSurah}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Verse {verse.numberInSurah} of {surah.numberOfAyahs}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="p-2 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                        <FaBookmark />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                        <FaShare />
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className="mb-6">
               <div className="mb-6 text-center">
  <p
    className="leading-loose text-gray-800 dark:text-gray-200"
    style={{
      fontFamily: "'Scheherazade', serif", // يمكنك تغييره إلى خط قرآني أفضل عند توفره
      fontSize: "2.4em",
      direction: "rtl",
      lineHeight: "2.8",
      textAlign: "center",
      letterSpacing: "0.03em",
      wordSpacing: "0.1em",
    }}
  >
    {verse.text}
    {verse.sajda ? <span> </span>:null}
    <span
    className="mx-5"
     
    >
      ﴿
      {verse.numberInSurah}﴾
      
    </span>
  </p>
</div>

                  </div>

                  {/* Decorative Line */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                        {verse.numberInSurah}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {!loading && !error && filteredVerses.length > 0 && (
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

export default Surah;
