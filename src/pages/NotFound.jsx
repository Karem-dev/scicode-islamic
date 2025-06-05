import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaHome, FaArrowLeft, FaSearch } from "react-icons/fa";

function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="relative">
                <div className="text-9xl font-bold text-emerald-600 dark:text-emerald-400 opacity-20">
                  404
                </div>
                {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <FaSearch className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                </div> */}
              </div>
            </div>

            {/* Message */}
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </p>

            {/* Navigation Options */}
            <div className="space-y-4 flex justify-between md:flex-row flex-col">
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaArrowLeft />
                <span>Go Back</span>
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto px-6 py-5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaHome />
                <span>Go to Homepage</span>
              </button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                You might be looking for:
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => navigate("/surahs")}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-left"
                >
                  <h3 className="font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    Quran Surahs
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Browse and read the Holy Quran
                  </p>
                </button>
                <button
                  onClick={() => navigate("/azkar")}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-left"
                >
                  <h3 className="font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    Islamic Azkar
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Morning and evening remembrances
                  </p>
                </button>
                <button
                  onClick={() => navigate("/prayer-times")}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-left"
                >
                  <h3 className="font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    Prayer Times
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Check prayer times in your location
                  </p>
                </button>
                <button
                  onClick={() => navigate("/find-mosque")}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-left"
                >
                  <h3 className="font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    Find Mosque
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Locate nearby mosques
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;
