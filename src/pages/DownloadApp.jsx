import React from "react";
import { motion } from "framer-motion";
import {
    FaDownload,
    FaAndroid,
    FaApple,
    FaShieldAlt,
    FaWifi,
    FaBell,
    FaBookmark,
    FaArrowRight,
    FaArrowLeft
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import appMockup from "../assets/app-mockup.png";

function DownloadApp() {
    const { t, isRTL } = useLanguage();
    const downloadUrl = "https://expo.dev/artifacts/eas/u9URigWd8dBpNLFQJF8BY2.apk";

    const features = [
        {
            icon: <FaWifi />,
            title: t.offlineAccess,
            desc: t.offlineAccessDesc,
            color: "bg-blue-500/10 text-blue-500",
        },
        {
            icon: <FaBell />,
            title: t.accurateNotifications,
            desc: t.accurateNotificationsDesc,
            color: "bg-emerald-500/10 text-emerald-500",
        },
        {
            icon: <FaBookmark />,
            title: t.customBookmarks,
            desc: t.customBookmarksDesc,
            color: "bg-amber-500/10 text-amber-500",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6 },
        },
    };

    return (
        <div className={`min-h-screen mesh-gradient transition-colors duration-500 ${isRTL ? 'font-arabic' : ''}`}>
            <Navbar />

            <main className="container mx-auto max-w-7xl pt-32 pb-20 px-6">
                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold uppercase tracking-widest text-xs"
                    >
                        {isRTL ? <FaArrowRight /> : <FaArrowLeft />}
                        {t.back}
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col space-y-8"
                    >
                        <motion.div variants={itemVariants}>
                            <span className="inline-block px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                                {t.downloadApp}
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
                                {t.getAppTitle} <br />
                                <span className="text-gradient">{t.getAppSubtitle}</span>
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                                {t.getAppDesc}
                            </p>
                        </motion.div>

                        {/* Buttons */}
                        <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-premium group flex items-center gap-3"
                            >
                                <FaDownload className="text-lg" />
                                <span>{t.installNow}</span>
                            </a>
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold hover:border-emerald-500/50 transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-black/5"
                            >
                                <FaAndroid className="text-xl text-emerald-500" />
                                <span>{t.directDownload}</span>
                            </a>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center gap-4 text-sm text-slate-400 dark:text-slate-500 font-bold">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                    <FaAndroid />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                    <FaApple />
                                </div>
                            </div>
                            <span>{t.availableOn}</span>
                        </motion.div>

                        <hr className="border-slate-200 dark:border-white/5 w-full max-w-md" />
                    </motion.div>

                    {/* Right Column: Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="relative"
                    >
                        {/* Background blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/20 rounded-full blur-[100px] -z-10" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] -z-10" />

                        <motion.img
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            src={appMockup}
                            alt="App Mockup"
                            className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_35px_35px_rgba(16,185,129,0.1)]"
                        />

                        {/* Floating Badges */}
                        <motion.div
                            animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-20 -right-4 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white dark:border-white/10 shadow-2xl flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                <FaShieldAlt />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified</div>
                                <div className="text-sm font-black text-slate-900 dark:text-white">Secure Build</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Features Section */}
                <section className="mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                            {t.appFeaturesTitle}
                        </h2>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-600 to-teal-400 mx-auto rounded-full" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="card-premium group"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center">
                <p className="text-sm text-slate-400 font-bold">
                    &copy; {new Date().getFullYear()} {t.appName}. {t.craftedBy}{" "}
                    <a href="#" className="text-emerald-600 hover:underline">Karem Mahmoud</a>
                </p>
            </footer>
        </div>
    );
}

export default DownloadApp;
