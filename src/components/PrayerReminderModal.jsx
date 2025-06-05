import React from "react";
import Modal from "./Modal";

const PrayerReminderModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="text-center">
          <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            تذكير هام
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Important Reminder</p>
        </div>
      }
    >
      <div className="text-center space-y-8">
        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-xl">
          <p className="text-xl font-medium text-emerald-800 dark:text-emerald-300 mb-4">
            Don't forget to pray for:
          </p>
          <ul className="space-y-4 text-right">
            <li className="flex items-center bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex-1">
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  اذا واجدت اي مشاكل في الذكر او الايات تاكد من ان لغه الموقع هي
                  الانجليزيه وليس مترجم
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If you find any issues with the Azkar or verses, make sure the
                  website language is English and not translated
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-emerald-600 dark:text-emerald-400 text-2xl">
                  •
                </span>
              </div>
            </li>
            <li className="flex items-center bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex-1">
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  لا تنس ان تذكر صاحب الموقع واخوانك في غزه بالدعاء ولكم بالمثل
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Don't forget to pray for the website owner and our brothers in
                  Gaza, and may Allah reward you the same
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-emerald-600 dark:text-emerald-400 text-2xl">
                  •
                </span>
              </div>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium mb-6">
            تقبل الله منا ومنكم صالح الاعمال
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-6">
            May Allah accept our good deeds and yours
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 text-lg font-medium shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PrayerReminderModal;
