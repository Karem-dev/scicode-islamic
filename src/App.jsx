import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Surahs from "./pages/Quraan/Surahs";
import Surah from "./pages/Quraan/Surah";
import PrayerTimes from "./pages/PrayerTimes";
import FindMosque from "./pages/FindMosque";
import Azkar from "./pages/Azkar";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/surahs" element={<Surahs />} />
      <Route path="/surah/:id" element={<Surah />} />
      <Route path="/prayer-times" element={<PrayerTimes />} />
      <Route path="/find-mosque" element={<FindMosque />} />
      <Route path="/azkar" element={<Azkar />} />
      <Route path="/azkar/:category" element={<Azkar />} />
    </Routes>
  );
}

export default App;
