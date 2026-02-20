import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Surahs from "./pages/Quraan/Surahs";
import Surah from "./pages/Quraan/Surah";
import PrayerTimes from "./pages/PrayerTimes";
import FindMosque from "./pages/FindMosque";
import Azkar from "./pages/Azkar";

import Khatmah from "./pages/Khatmah";
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/surahs" element={<Surahs />} />
      <Route path="/surah/:id" element={<Surah />} />
      <Route path="/prayer-times" element={<PrayerTimes />} />

      <Route path="/khatmah" element={<Khatmah />} />
      <Route path="/find-mosque" element={<FindMosque />} />
      <Route path="/azkar" element={<Azkar />} />
      <Route path="/azkar/:category" element={<Azkar />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
