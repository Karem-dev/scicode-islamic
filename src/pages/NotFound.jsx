import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { FaHome, FaArrowLeft, FaQuran, FaPray, FaClock, FaMosque } from "react-icons/fa";

function NotFound() {
  const navigate = useNavigate();

  const navLinks = [
    { title: "Holy Quran", desc: "Read the divine verses", path: "/surahs", icon: <FaQuran /> },
    { title: "Daily Azkar", desc: "Morning & evening dhikr", path: "/azkar", icon: <FaPray /> },
    { title: "Prayer Times", desc: "Check local timings", path: "/prayer-times", icon: <FaClock /> },
    { title: "Find Mosque", desc: "Locate nearby masjids", path: "/find-mosque", icon: <FaMosque /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 relative inline-block"
        >
          <h1 className="text-[12rem] md:text-[16rem] font-black text-emerald-500/10 dark:text-emerald-500/5 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-6 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-widest backdrop-blur-sm border border-emerald-500/20">
              Page Not Found
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Looking for <span className="text-emerald-500">guidance?</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto mb-12">
            The path you've taken seems to be missing. Let's get you back to something meaningful.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <FaArrowLeft className="text-xs" /> Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-10 py-5 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
            >
              <FaHome /> Return Home
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {navLinks.map((link, idx) => (
              <motion.button
                key={link.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                onClick={() => navigate(link.path)}
                className="group p-6 text-right bg-white dark:bg-[#0a1611] rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  {link.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {link.desc}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default NotFound;

