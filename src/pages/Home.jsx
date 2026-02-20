import React from "react";
import {
  FaQuran,
  FaClock,
  FaBook,
  FaArrowRight,
  FaStar,
  FaHeart,
  FaMosque,
  FaCompass,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const features = [
    {
      icon: <FaQuran />,
      title: "Holy Quran",
      description: "Experience the divine word with translations and immersive audio recitations.",
      link: "/surahs",
      color: "from-emerald-400 to-teal-500",
      delay: 0.2
    },
    {
      icon: <FaClock />,
      title: "Prayer Times",
      description: "Stay connected with accurate prayer schedules and localized notifications.",
      link: "/prayer-times",
      color: "from-amber-400 to-orange-500",
      delay: 0.3
    },
    {
      icon: <FaCompass />,
      title: "Qibla Finder",
      description: "Locate the precise direction of the Kaaba from anywhere in the world.",
      link: "/qibla",
      color: "from-blue-400 to-indigo-500",
      delay: 0.4
    },
    {
      icon: <FaBook />,
      title: "Daily Azkar",
      description: "Nourish your soul with verified morning, evening, and situational supplications.",
      link: "/azkar",
      color: "from-rose-400 to-pink-500",
      delay: 0.5
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfb] dark:bg-[#060d0a] transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background Ornaments */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -mr-64 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-3xl -ml-32 -mb-16 pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-8"
            >
              <FaStar className="mr-2 text-xs" />
              Comprehensive Islamic Portal
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8 text-slate-900 dark:text-white leading-[1.1]"
            >
              Nurture Your Faith with <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Divine Knowledge
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Your digital companion for the Holy Quran, accurate prayer schedules,
              and a library of daily azkar designed for the modern lifestyle.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/surahs"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center group"
              >
                Start Reading Quran
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/azkar"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center group"
              >
                Explore Azkar
                <FaBook className="ml-2 group-hover:scale-110 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Essential Tools for Every Muslim
            </h2>
            <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Link
                  to={feature.link}
                  className="group relative h-full flex flex-col p-8 rounded-[2rem] bg-white dark:bg-[#0a1611] border border-slate-100 dark:border-emerald-500/10 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-2xl mb-6 shadow-inner`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="mt-auto flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm group-hover:gap-2 transition-all">
                    Learn More <FaArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-900 to-teal-950 p-12 md:p-20 text-center"
          >
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
              <FaMosque className="text-[300px]" />
            </div>

            <FaHeart className="text-emerald-400 text-5xl mb-8 mx-auto animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to embark on a <br className="hidden md:block" />
              spiritual journey?
            </h2>
            <p className="text-emerald-100/70 text-lg mb-12 max-w-xl mx-auto">
              Access the Holy Quran and other essential Islamic features
              completely free, anytime, anywhere.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/prayer-times"
                className="px-10 py-5 rounded-2xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition-all shadow-xl shadow-black/10 flex items-center"
              >
                Prayer Schedules
              </Link>
              <Link
                to="/surahs"
                className="px-10 py-5 rounded-2xl bg-emerald-800/50 border border-emerald-400/30 text-white font-bold backdrop-blur-md hover:bg-emerald-800/80 transition-all flex items-center"
              >
                Read Quran
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simplified Premium Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <FaQuran />
              </div>
              <div>
                <span className="block text-lg font-bold text-slate-900 dark:text-white">Sci-Code Islamic</span>
                <span className="text-xs text-slate-500 tracking-wider uppercase">Faith & Technology</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Link to="/surahs" className="hover:text-emerald-600 transition-colors">Quran</Link>
              <Link to="/prayer-times" className="hover:text-emerald-600 transition-colors">Prayers</Link>
              <Link to="/azkar" className="hover:text-emerald-600 transition-colors">Azkar</Link>
              <Link to="/find-mosque" className="hover:text-emerald-600 transition-colors">Mosques</Link>
            </div>

            <div className="text-sm text-slate-400 dark:text-slate-600">
              &copy; {new Date().getFullYear()} Crafted by{" "}
              <a
                href="https://karem-mahmoud.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Karem Mahmoud
              </a>{" "}
              &{" "}
              <a
                href="http://scicodeacademy.infinityfreeapp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Sci-Code Academy
              </a>
              . All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

