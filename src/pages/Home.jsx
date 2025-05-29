import React from "react";
import {
  FaQuran,
  FaPrayingHands,
  FaMosque,
  FaBook,
  FaArrowRight,
  FaStar,
  FaHeart,
  FaClock,
  FaMapMarkerAlt,
  FaCopyright,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const features = [
    {
      icon: <FaQuran />,
      title: "Quran Reading",
      description:
        "Read and listen to the Holy Quran with translations and tafsir",
      link: "/surahs",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      icon: <FaClock />,
      title: "Prayer Times",
      description:
        "Get accurate prayer times and qibla direction for your location",
      link: "/prayer-times",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: <FaBook />,
      title: "Azkar & Duas",
      description:
        "Access morning and evening azkar with benefits and repetition counts",
      link: "/azkar",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 pt-24">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {/* <FaStar className="text-4xl text-emerald-500 animate-pulse" /> */}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-emerald-800 dark:text-emerald-300 mb-6">
            Welcome to Sci-Code Islamic Portal
          </h1>
          <p className="text-lg md:text-xl text-emerald-700 dark:text-emerald-200 mb-8 max-w-2xl mx-auto">
            Your comprehensive Islamic companion for Quran, prayers, and daily
            azkar
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/surahs"
              className="bg-emerald-600 dark:bg-emerald-500 text-white px-8 py-3 rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-600 transition duration-300 flex items-center space-x-2"
            >
              <span>Explore Quran</span>
              <FaArrowRight />
            </Link>
            <Link
              to="/azkar"
              className="bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 px-8 py-3 rounded-full hover:bg-emerald-50 dark:hover:bg-gray-700 transition duration-300 flex items-center space-x-2"
            >
              <span>Start Azkar</span>
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-emerald-800 dark:text-emerald-300 mb-12">
          Explore Our Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className={`group relative overflow-hidden ${feature.bgColor} dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300`}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white dark:bg-gray-700 shadow-sm mb-4">
                <div
                  className={`text-5xl text-emerald-500   `}
                >
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {feature.description}
              </p>
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm font-medium">Explore</span>
                <FaArrowRight className="ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 dark:from-emerald-900 dark:to-emerald-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <FaHeart className="text-4xl text-white animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Your Islamic Journey Today
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our community and explore the beautiful teachings of Islam
            through our comprehensive portal
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/prayer-times"
              className="bg-white dark:bg-emerald-100 text-emerald-800 dark:text-emerald-900 px-8 py-3 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-200 transition duration-300 flex items-center space-x-2"
            >
              <FaClock className="mr-2" />
              <span>Check Prayer Times</span>
              <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/azkar"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-emerald-800 transition duration-300 flex items-center space-x-2"
            >
              <FaBook className="mr-2" />
              <span>Start Azkar</span>
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              <FaCopyright className="text-emerald-600 dark:text-emerald-400" />
              <span>
                {new Date().getFullYear()} Sci-Code Islamic. All rights
                reserved.
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="https://karemmahmouddev.netlify.app/"
                className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Developer Karem Mahmoud
              </Link>

              <Link
                to="https://www.linkedin.com/in/karem-mahmoud-963b84262/"
                className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
