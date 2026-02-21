import React, { createContext, useContext, useState, useEffect } from "react";
import { ar } from "../locales/ar";
import { en } from "../locales/en";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem("lang") || "ar";
    });

    const translations = lang === "ar" ? ar : en;

    useEffect(() => {
        localStorage.setItem("lang", lang);
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = lang;
    }, [lang]);

    const toggleLanguage = () => {
        setLang((prev) => (prev === "ar" ? "en" : "ar"));
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t: translations, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
