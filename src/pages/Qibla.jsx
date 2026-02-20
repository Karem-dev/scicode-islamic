import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCompass, FaMapMarkerAlt, FaInfoCircle, FaLocationArrow, FaMosque } from "react-icons/fa";
import Navbar from "../components/Navbar";
import PrayerReminderModal from "../components/PrayerReminderModal";

const Qibla = () => {
  const [showReminder, setShowReminder] = useState(false);
  const [coords, setCoords] = useState(null);
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState(null);

  const KAABA = { lat: 21.422487, lng: 39.826206 };

  const calculateQibla = (lat1, lng1) => {
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (KAABA.lat * Math.PI) / 180;
    const lam1 = (lng1 * Math.PI) / 180;
    const lam2 = (KAABA.lng * Math.PI) / 180;

    const angle =
      (Math.atan2(
        Math.sin(lam2 - lam1),
        Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(lam2 - lam1)
      ) * 180) / Math.PI;

    return (angle + 360) % 360;
  };

  useEffect(() => {
    setShowReminder(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ latitude, longitude });
          setQiblaAngle(calculateQibla(latitude, longitude));
        },
        (err) => {
          setError("Location access is required to find the Qibla.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }

    const handleOrientation = (e) => {
      const compass = e.webkitCompassHeading || (360 - e.alpha);
      if (compass) setHeading(compass);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6">
            <FaCompass className="text-[10px]" />
            Al-Qibla Finder
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Facing the <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Holy Kaaba</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Align your heart and prayer towards Makkah with our precision compass.
          </p>
        </motion.div>

        <div className="flex flex-col items-center">
          {/* Compass Container */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 mb-16">
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />

            {/* Outer Ring */}
            <div className="absolute inset-0 border-8 border-slate-100 dark:border-white/5 rounded-full shadow-inner" />

            {/* Degree Markers */}
            <div className="absolute inset-4 border-2 border-emerald-500/20 rounded-full">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-3 bg-slate-300 dark:bg-white/10 left-1/2 -translate-x-1/2 origin-[center_176px] md:origin-[center_176px]"
                  style={{ transform: `rotate(${i * 30}deg) translateY(-176px)` }}
                />
              ))}
            </div>

            {/* The Compass Plate */}
            <motion.div
              animate={{ rotate: -heading }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* North Indicator */}
              <div className="absolute top-8 font-black text-emerald-600 dark:text-emerald-400 text-xl">N</div>

              {/* Qibla Indicator */}
              <AnimatePresence>
                {qiblaAngle !== null && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: qiblaAngle }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-1 h-32 md:h-44 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full relative bottom-16 md:bottom-22" />
                    <div className="absolute top-2 md:top-6 flex flex-col items-center">
                      <FaMosque className="text-3xl md:text-5xl text-emerald-600 dark:text-emerald-400 drop-shadow-lg" />
                      <div className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] bg-white dark:bg-[#0a1611] px-2 py-1 rounded-full shadow-sm">Qibla</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Center Dot */}
              <div className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white border-4 border-emerald-500 z-30" />
            </motion.div>
          </div>

          {/* Info Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-[#0a1611] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-emerald-500/5"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Your Location</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Current Coordinates</p>
                </div>
              </div>
              {coords ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Latitude</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{coords.latitude.toFixed(4)}° N</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Longitude</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{coords.longitude.toFixed(4)}° E</span>
                  </div>
                </div>
              ) : error ? (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              ) : (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Locating...</p>
                </div>
              )}
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-600/20 text-white"
            >
              <div className="flex items-center gap-4 mb-6 text-white/90">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
                  <FaLocationArrow />
                </div>
                <div>
                  <h3 className="font-bold">Direction</h3>
                  <p className="text-xs text-white/60">Heading Angle</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center group">
                  <span className="text-white/60 text-sm">Qibla Angle</span>
                  <span className="text-3xl font-black">{qiblaAngle ? `${Math.round(qiblaAngle)}°` : "--"}</span>
                </div>
                <div className="flex justify-between items-center opacity-60">
                  <span className="text-xs uppercase tracking-widest">From True North</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 flex items-start gap-4 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl max-w-2xl">
            <FaInfoCircle className="mt-1 text-emerald-500/50 flex-shrink-0" />
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              For best accuracy, hold your device flat and stay away from metallic objects or electromagnetic interference. If you're on a mobile device, rotate your body until the mosque icon points directly upwards.
            </p>
          </div>
        </div>

        <PrayerReminderModal
          isOpen={showReminder}
          onClose={() => setShowReminder(false)}
        />
      </main>

      <style>{`
        .bottom-22 { bottom: 5.5rem; }
      `}</style>
    </div>
  );
};

export default Qibla;
