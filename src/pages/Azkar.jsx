import React, { useState, useEffect } from "react";
import {
  FaSun,
  FaMoon,
  FaPray,
  FaArrowLeft,
  FaVolumeUp,
  FaVolumeMute,
  FaCheckCircle,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PrayerReminderModal from "../components/PrayerReminderModal";
import Modal from "../components/Modal";

function Azkar() {
  const [azkarData, setAzkarData] = useState({
    sabah: [],
    massa: [],
    postPrayer: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [counters, setCounters] = useState({});
  const [completedAzkar, setCompletedAzkar] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { category } = useParams();
  const [showReminder, setShowReminder] = useState(false);
  const [isEnglish, setIsEnglish] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    const fetchAzkar = async () => {
      try {
        const [sabahRes, massaRes, postPrayerRes] = await Promise.all([
          axios.get(
            "https://ahegazy.github.io/muslimKit/json/azkar_sabah.json"
          ),
          axios.get(
            "https://ahegazy.github.io/muslimKit/json/azkar_massa.json"
          ),
          axios.get(
            "https://ahegazy.github.io/muslimKit/json/PostPrayer_azkar.json"
          ),
        ]);

        setAzkarData({
          sabah: sabahRes.data.content,
          massa: massaRes.data.content,
          postPrayer: postPrayerRes.data.content,
        });
        setLoading(false);
      } catch (error) {
        setError("Error loading Azkar. Please try again later.");
        setLoading(false);
        console.error("Error fetching Azkar:", error);
      }
    };

    fetchAzkar();
  }, []);

  useEffect(() => {
    // Show initial reminder modal
    const timer = setTimeout(() => {
      setShowReminder(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseReminder = () => {
    setShowReminder(false);
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
  };

  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const tabConfig = [
    {
      id: "sabah",
      label: "أذكار الصباح",
      icon: FaSun,
      data: azkarData.sabah,
      description: "Morning Azkar for protection and blessings",
    },
    {
      id: "massa",
      label: "أذكار المساء",
      icon: FaMoon,
      data: azkarData.massa,
      description: "Evening Azkar for protection and blessings",
    },
    {
      id: "postPrayer",
      label: "أذكار بعد الصلاة",
      icon: FaPray,
      data: azkarData.postPrayer,
      description: "Azkar to be recited after prayers",
    },
  ];

  const handlePlayAudio = (zekr) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }

    if (!isPlaying) {
      const audio = new Audio(
        `https://audio.islamweb.net/audio/index.php?page=fullcontent&audioid=${zekr.id}`
      );
      audio.play();
      setCurrentAudio(audio);
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
    }
  };

  const incrementCounter = (index) => {
    const newCount = (counters[index] || 0) + 1;
    setCounters((prev) => ({
      ...prev,
      [index]: newCount,
    }));

    const currentCategory = tabConfig.find((tab) => tab.id === category);
    if (currentCategory && newCount >= currentCategory.data[index].repeat) {
      setCompletedAzkar((prev) => [...prev, index]);
      if (index === currentIndex) {
        setCurrentIndex((prev) => prev + 1);
        
        // Check if all azkar are completed
        if (currentIndex + 1 >= currentCategory.data.length) {
          setShowCompletionModal(true);
        }
      }
    }
  };

  const resetCounter = (index) => {
    setCounters((prev) => ({
      ...prev,
      [index]: 0,
    }));
    setCompletedAzkar((prev) => prev.filter((i) => i !== index));
  };

  const renderCategoryList = () => {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tabConfig.map((tab) => (
          <div
            key={tab.id}
            onClick={() => navigate(`/azkar/${tab.id}`)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <tab.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {tab.label}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {tab.description}
            </p>
            <div className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
              {tab.data.length} Azkar
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDetailedView = () => {
    const currentCategory = tabConfig.find((tab) => tab.id === category);
    if (!currentCategory) return null;

    const currentZekr = currentCategory.data[currentIndex];
    if (!currentZekr) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
            مبروك! لقد أكملت جميع الأذكار
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Congratulations! You have completed all the Azkar
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setCounters({});
              setCompletedAzkar([]);
              setShowCompletionModal(true);
            }}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Start Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/azkar")}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <FaArrowLeft />
            <span>Back to Categories</span>
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {currentCategory.label}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} of {currentCategory.data.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <p
                onClick={() => incrementCounter(currentIndex)}
                className="text-2xl font-arabic text-right mb-4 leading-loose dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {currentZekr.zekr}
              </p>
              {currentZekr.bless && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                  Benefit: {currentZekr.bless}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Target: {currentZekr.repeat}x
              </span>
              <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                Count: {counters[currentIndex] || 0}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => incrementCounter(currentIndex)}
                className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
              >
                Count
              </button>
              <button
                onClick={() => resetCounter(currentIndex)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((currentIndex + 1) / currentCategory.data.length) * 100
              }%`,
            }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span>Loading Azkar...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
          <div className="container mx-auto px-4">
            <div className="text-center text-red-600 dark:text-red-400">
              {error}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-emerald-800 dark:text-emerald-300 mb-4">
              Islamic Azkar
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Remembrance of Allah for every occasion
            </p>
            <button
              onClick={toggleLanguage}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            >
              {isEnglish ? "عربي" : "English"}
            </button>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto">
            {category && (
              <button
                onClick={() => navigate("/azkar")}
                className="flex items-center text-gray-600 dark:text-gray-300 mb-6 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <FaArrowLeft className="mr-2" />
                Back to Categories
              </button>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-600 dark:text-gray-300">
                  Loading Azkar...
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 dark:text-red-400">{error}</div>
              </div>
            ) : (
              <div>
                {category ? renderDetailedView() : renderCategoryList()}
              </div>
            )}
          </div>

          {/* Initial Reminder Modal */}
          <PrayerReminderModal
            isOpen={showReminder}
            onClose={handleCloseReminder}
          />

          {/* Completion Modal */}
          <Modal
            isOpen={showCompletionModal}
            onClose={handleCloseCompletionModal}
            title={
              <div className="text-center">
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  مبروك! 🎉
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Congratulations!
                </p>
              </div>
            }
          >
            <div className="text-center space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-lg">
                <p className="text-lg font-medium text-emerald-800 dark:text-emerald-300">
                  Thank you for completing the Azkar!
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                  May Allah accept your good deeds
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Don't forget to pray for:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-4">
                      <span className="text-emerald-600 dark:text-emerald-400 text-xl">•</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200">The website owner</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">May Allah bless their efforts</p>
                    </div>
                  </li>
                  <li className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-4">
                      <span className="text-emerald-600 dark:text-emerald-400 text-xl">•</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200">Our brothers and sisters in Gaza</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">May Allah protect and strengthen them</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                  "The supplication of a Muslim for his brother in his absence is answered. At his head is an angel, and every time he makes a supplication for good for him, the angel who is assigned to him says: 'Ameen, and may you have the same.'"
                </p>
                <button
                  onClick={handleCloseCompletionModal}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
}

export default Azkar;
