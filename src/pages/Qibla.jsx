import React, { useState, useEffect } from "react";
import PrayerReminderModal from "../components/PrayerReminderModal";
import Navbar from "../components/Navbar";

const Qibla = () => {
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    // Show modal immediately when component mounts
    setShowReminder(true);
  }, []);

  const handleCloseReminder = () => {
    setShowReminder(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Qibla Direction
          </h1>

          {/* Qibla content will go here */}
          <div className="space-y-6">{/* Add your Qibla content here */}</div>

          <PrayerReminderModal
            isOpen={showReminder}
            onClose={handleCloseReminder}
          />
        </div>
      </div>
    </>
  );
};

export default Qibla;
