import React, { useState, useEffect } from "react";
import {
  FaMosque,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaCloudMoon,
  FaSearch,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import axios from "axios";
import PrayerReminderModal from "../components/PrayerReminderModal";

function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({
    city: "Cairo",
    country: "Egypt",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.aladhan.com/v1/timingsByCity?city=${location.city}&country=${location.country}&method=4`
        );
        setPrayerTimes(response.data.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReminder(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLocationChange = (e) => {
    const [city, country] = e.target.value.split(", ");
    setLocation({ city, country });
    setShowSearch(false);
  };

  const handleCloseReminder = () => {
    setShowReminder(false);
  };

  const prayerIcons = {
    Fajr: <FaCloudSun className="w-6 h-6" />,
    Sunrise: <FaSun className="w-6 h-6" />,
    Dhuhr: <FaSun className="w-6 h-6" />,
    Asr: <FaCloudSun className="w-6 h-6" />,
    Maghrib: <FaCloudMoon className="w-6 h-6" />,
    Isha: <FaMoon className="w-6 h-6" />,
  };

  const prayerNames = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center dark:bg-gray-900 h-screen">
        <div className="text-gray-600 dark:text-gray-300">
          Loading prayer times...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400">
        Error loading prayer times. Please try again later.
      </div>
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
              Prayer Times
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {prayerTimes?.date?.readable} - {prayerTimes?.date?.hijri?.date}
            </p>
          </div>

          {/* Location Selector */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <div
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-4 cursor-pointer"
                onClick={() => setShowSearch(!showSearch)}
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {location.city}, {location.country}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to change location
                  </p>
                </div>
                <FaSearch className="text-emerald-600 dark:text-emerald-400" />
              </div>

              {showSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10">
                  <input
                    type="text"
                    placeholder="Search city, country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300  dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                  />
                  <div className="max-h-60 overflow-y-auto dark:text-white">
                    {[
                      "Cairo, Egypt",
                      "Mansoura, Egypt",
                      "Tanta, Egypt",
                      "Alexandria, Egypt",
                      "Giza, Egypt",
                      "Mecca, Saudi Arabia",
                      "Medina, Saudi Arabia",
                      "Dubai, UAE",
                      "Istanbul, Turkey",
                      "Jakarta, Indonesia",
                      "Kuala Lumpur, Malaysia",
                      "London, UK",
                      "New York, USA",
                    ]
                      .filter((loc) =>
                        loc.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((loc) => (
                        <div
                          key={loc}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                          onClick={() =>
                            handleLocationChange({ target: { value: loc } })
                          }
                        >
                          {loc}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prayer Times Grid */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(prayerIcons).map(([prayer, icon]) => (
              <div
                key={prayer}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-emerald-600 dark:text-emerald-400">
                      {icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {prayer}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {prayerNames[prayer]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {prayerTimes?.timings?.[prayer]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <PrayerReminderModal
            isOpen={showReminder}
            onClose={handleCloseReminder}
          />
        </div>
      </div>
    </>
  );
}

export default PrayerTimes;
