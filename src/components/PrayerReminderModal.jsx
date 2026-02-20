import React from "react";
import Modal from "./Modal";
import { motion } from "framer-motion";

const PrayerReminderModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

        .prayer-modal-card {
          background: linear-gradient(165deg, #0d1a12 0%, #07120c 100%);
          color: white;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .prayer-modal-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .prayer-modal-header {
          padding: 40px 32px 24px;
          text-align: center;
          position: relative;
          background: rgba(0, 0, 0, 0.2);
        }

        .prayer-modal-icon {
          font-size: 48px;
          line-height: 1;
          margin-bottom: 16px;
          display: block;
          color: #fbbf24;
          filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4));
        }

        .prayer-modal-title-ar {
          font-family: 'Amiri', serif;
          font-size: 32px;
          color: #fcd34d;
          direction: rtl;
          margin-bottom: 4px;
          font-weight: 700;
        }

        .prayer-modal-title-en {
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          color: rgba(252, 211, 77, 0.5);
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0;
        }

        .prayer-modal-body {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .prayer-modal-lead {
          font-family: 'Amiri', serif;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
          margin-bottom: 4px;
          font-style: italic;
        }

        .prayer-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(16, 185, 129, 0.1);
          border-left: 4px solid #10b981;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .prayer-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(16, 185, 129, 0.3);
          transform: translateX(4px);
        }

        .prayer-item-ar {
          font-family: 'Amiri', serif;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.95);
          direction: rtl;
          line-height: 1.8;
          margin-bottom: 8px;
        }

        .prayer-item-en {
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          color: rgba(16, 185, 129, 0.8);
          font-weight: 400;
          line-height: 1.6;
        }

        .divider-ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 12px 0;
        }

        .divider-line {
          height: 1px;
          flex: 1;
          background: linear-gradient(90deg, transparent, rgba(252, 211, 77, 0.3), transparent);
        }

        .divider-symbol {
          color: #fcd34d;
          font-size: 18px;
          opacity: 0.6;
        }

        .prayer-modal-footer-text {
          font-family: 'Amiri', serif;
          font-size: 18px;
          color: #fcd34d;
          text-align: center;
          direction: rtl;
          font-style: italic;
        }

        .prayer-modal-footer-text-en {
          font-family: 'Lato', sans-serif;
          font-size: 12px;
          color: rgba(252, 211, 77, 0.4);
          text-align: center;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .prayer-modal-actions {
          padding: 24px 32px 40px;
          display: flex;
          justify-content: center;
        }

        .prayer-close-btn {
          position: relative;
          padding: 14px 48px;
          background: #10b981;
          border: none;
          border-radius: 12px;
          color: #064e3b;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }

        .prayer-close-btn:hover {
          background: #34d399;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        .prayer-close-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 640px) {
          .prayer-modal-body { padding: 24px; }
          .prayer-modal-header { padding: 32px 24px 20px; }
          .prayer-modal-title-ar { font-size: 26px; }
          .prayer-item { padding: 16px; }
        }
      `}</style>

      <div className="prayer-modal-card">
        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
          </svg>
        </div>

        {/* Header */}
        <div className="prayer-modal-header">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prayer-modal-icon"
          >
            🌙
          </motion.span>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="prayer-modal-title-ar"
          >
            تذكير هام
          </motion.p>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="prayer-modal-title-en"
          >
            Important Reminder
          </motion.p>
        </div>

        {/* Body */}
        <div className="prayer-modal-body">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="prayer-modal-lead"
          >
            Don't forget to pray for:
          </motion.p>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="prayer-item"
          >
            <p className="prayer-item-ar">
              اذا وجدت أي مشاكل في الأذكار أو الآيات تأكد من أن لغة الموقع هي الإنجليزية وليس مترجم
            </p>
            <p className="prayer-item-en">
              Ensure site language is English if Azkar/verses appear incorrectly.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="prayer-item"
          >
            <p className="prayer-item-ar">
              لا تنسَ ذكر صاحب الموقع وإخوانك في غزة بالدعاء ولكم بالمثل
            </p>
            <p className="prayer-item-en">
              Remember the site owner and our brothers in Gaza in your prayers.
            </p>
          </motion.div>

          <div className="divider-ornament">
            <div className="divider-line"></div>
            <span className="divider-symbol">✦</span>
            <div className="divider-line"></div>
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="prayer-modal-footer-text">
              تقبل الله منا ومنكم صالح الأعمال
            </p>
            <p className="prayer-modal-footer-text-en">
              May Allah accept our good deeds and yours
            </p>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="prayer-modal-actions">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="prayer-close-btn"
            onClick={onClose}
          >
            Close
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default PrayerReminderModal;
