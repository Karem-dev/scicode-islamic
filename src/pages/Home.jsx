import React from "react";
import {
  FaQuran,
  FaClock,
  FaBook,
  FaArrowRight,
  FaStar,
  FaHeart,
  FaMosque,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

function Home() {
  const { t } = useLanguage();
  const features = [
    {
      icon: <FaQuran />,
      title: t.quran,
      description: "Experience the divine word with translations and immersive audio recitations in a beautiful interface.",
      link: "/surahs",
      color: "from-emerald-400 to-teal-500",
      delay: 0.2
    },
    {
      icon: <FaClock />,
      title: t.prayers,
      description: "Stay connected with accurate prayer schedules and localized notifications for your daily spiritual routine.",
      link: "/prayer-times",
      color: "from-amber-400 to-orange-500",
      delay: 0.3
    },
    {
      icon: <FaBook />,
      title: t.azkar,
      description: "Nourish your soul with verified morning, evening, and situational supplications from the Sunnah.",
      link: "/azkar",
      color: "from-rose-400 to-pink-500",
      delay: 0.5
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen mesh-gradient transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Animated Background Ornaments */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] -ml-64 -mb-32 pointer-events-none"
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "circOut" }}
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 text-emerald-700 dark:text-emerald-400 text-[13px] font-black tracking-widest uppercase mb-12 shadow-xl shadow-emerald-500/5 shadow-white/10"
            >
              <FaStar className="mr-3 text-xs animate-pulse" />
              {t.appName} {t.faithTech}
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl font-black mb-10 text-slate-900 dark:text-white leading-[0.95] tracking-tight"
            >
              {t.heroTitle} <br />
              <span className="text-gradient">
                {t.heroSubtitle}
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed font-medium opacity-80"
            >
              {t.heroDesc}
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to="/surahs" className="btn-premium group w-full sm:w-auto">
                <span className="relative z-10 flex items-center justify-center">
                  {t.beginJourney}
                  <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Link>
              <Link
                to="/azkar"
                className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white font-black hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-white/10 transition-all flex items-center justify-center group shadow-xl shadow-black/5 active:scale-95"
              >
                {t.exploreSanctuary}
                <FaBook className="ml-3 group-hover:rotate-12 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24 text-center"
          >
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">
              {t.featuresTitle}
            </h2>
            <div className="h-2 w-32 bg-gradient-to-r from-emerald-600 to-teal-400 mx-auto rounded-full shadow-lg shadow-emerald-500/20" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Link
                  to={feature.link}
                  className="card-premium group h-full flex flex-col items-center text-center p-12"
                >
                  <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-3xl mb-8 shadow-2xl shadow-black/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-10 font-medium">
                    {feature.description}
                  </p>
                  <div className="mt-auto px-8 py-3 rounded-full bg-slate-100 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest border border-transparent group-hover:border-emerald-500/30 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-all flex items-center gap-3">
                    Learn More <FaArrowRight className="text-[10px] transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 p-16 md:p-32 text-center shadow-3xl"
          >
            {/* Background Decorative Element */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none"
            >
              <FaMosque className="text-[500px]" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <FaHeart className="text-emerald-400 text-6xl mb-12 mx-auto filter drop-shadow(0 0 20px rgba(52,211,153,0.4))" />
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-[1.1] tracking-tighter">
              {t.ctaTitle}
            </h2>
            <p className="text-emerald-100/60 text-xl mb-16 max-w-xl mx-auto font-medium">
              {t.ctaDesc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <Link
                to="/prayer-times"
                className="px-12 py-6 rounded-3xl bg-white text-emerald-900 font-black hover:bg-emerald-50 transition-all shadow-2xl active:scale-95 flex items-center"
              >
                Prayer Times
              </Link>
              <Link
                to="/surahs"
                className="px-12 py-6 rounded-3xl bg-transparent border-2 border-emerald-400/30 text-white font-black hover:bg-emerald-400/10 transition-all font-bold backdrop-blur-xl flex items-center active:scale-95"
              >
                Read Quran
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simplified Premium Footer */}
      <footer className="py-24 border-t border-slate-200 dark:border-white/5 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 items-center">
            <div className="flex flex-col items-center md:items-start space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xl">
                  <FaQuran className="text-2xl" />
                </div>
                <div>
                  <span className="block text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{t.appName}</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold tracking-[0.2em] uppercase">{t.faithTech}</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs text-center md:text-left">
                Empowering the modern Muslim with state-of-the-art digital experiences for a balanced spiritual life.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-[13px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <Link to="/surahs" className="hover:text-emerald-600 transition-colors">{t.quran}</Link>
              <Link to="/prayer-times" className="hover:text-emerald-600 transition-colors">{t.prayers}</Link>
              <Link to="/azkar" className="hover:text-emerald-600 transition-colors">{t.azkar}</Link>
              <Link to="/find-mosque" className="hover:text-emerald-600 transition-colors">{t.mosques}</Link>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="text-sm text-slate-400 dark:text-slate-600 font-bold">
                &copy; {new Date().getFullYear()} {t.craftedBy}{" "}
                <a
                  href="https://karem-mahmoud.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-black hover:underline"
                >
                  Karem Mahmoud
                </a>
              </div>
              <a
                href="http://scicodeacademy.infinityfreeapp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-400 dark:text-white/20 font-bold tracking-[0.3em] uppercase hover:text-emerald-500 transition-colors"
              >
                {t.academy}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
