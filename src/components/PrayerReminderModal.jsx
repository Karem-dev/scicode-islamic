import React, { useEffect, useState } from "react";
import Modal from "./Modal";

const PrayerReminderModal = ({ isOpen, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

        .prayer-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 20, 15, 0.78);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: clamp(12px, 4vw, 32px);
          box-sizing: border-box;
        }

        .prayer-modal-card {
          background: linear-gradient(160deg, #0f2318 0%, #0a1a10 60%, #071410 100%);
          border: 1px solid rgba(180, 145, 60, 0.35);
          border-radius: clamp(12px, 2.5vw, 20px);
          width: 100%;
          max-width: min(560px, 94vw);
          max-height: min(88vh, 680px);
          overflow-y: auto;
          box-shadow:
            0 0 0 1px rgba(180,145,60,0.1),
            0 24px 80px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.05);
          opacity: ${visible ? 1 : 0};
          transform: ${visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)"};
          transition: opacity 0.4s ease, transform 0.4s ease;
          scrollbar-width: thin;
          scrollbar-color: rgba(180,145,60,0.3) transparent;
        }

        .prayer-modal-card::-webkit-scrollbar {
          width: 4px;
        }
        .prayer-modal-card::-webkit-scrollbar-track {
          background: transparent;
        }
        .prayer-modal-card::-webkit-scrollbar-thumb {
          background: rgba(180,145,60,0.3);
          border-radius: 2px;
        }

        .prayer-modal-header {
          padding: clamp(20px, 4vw, 32px) clamp(20px, 4vw, 32px) clamp(12px, 2.5vw, 20px);
          text-align: center;
          border-bottom: 1px solid rgba(180,145,60,0.2);
          position: relative;
        }

        .prayer-modal-icon {
          font-size: clamp(28px, 6vw, 42px);
          line-height: 1;
          margin-bottom: 10px;
          display: block;
          filter: drop-shadow(0 0 12px rgba(210, 175, 80, 0.5));
        }

        .prayer-modal-title-ar {
          font-family: 'Amiri', serif;
          font-size: clamp(20px, 4.5vw, 28px);
          color: #d4aa40;
          direction: rtl;
          margin: 0 0 4px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .prayer-modal-title-en {
          font-family: 'Lato', sans-serif;
          font-size: clamp(11px, 2vw, 13px);
          color: rgba(212, 170, 64, 0.6);
          font-weight: 300;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin: 0;
        }

        .prayer-modal-body {
          padding: clamp(16px, 3.5vw, 28px) clamp(20px, 4vw, 32px);
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 2.5vw, 18px);
        }

        .prayer-modal-lead {
          font-family: 'Amiri', serif;
          font-size: clamp(14px, 3vw, 17px);
          color: rgba(255,255,255,0.75);
          text-align: center;
          margin: 0 0 4px;
          font-style: italic;
        }

        .prayer-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(180,145,60,0.15);
          border-left: 3px solid rgba(180,145,60,0.5);
          border-radius: 8px;
          padding: clamp(12px, 2.5vw, 18px) clamp(14px, 3vw, 22px);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .prayer-item-ar {
          font-family: 'Amiri', serif;
          font-size: clamp(14px, 3vw, 17px);
          color: rgba(255,255,255,0.9);
          direction: rtl;
          line-height: 1.7;
          margin: 0;
        }

        .prayer-item-en {
          font-family: 'Lato', sans-serif;
          font-size: clamp(11px, 2.2vw, 13px);
          color: rgba(180,145,60,0.7);
          font-weight: 300;
          line-height: 1.5;
          margin: 0;
        }

        .prayer-modal-footer-text {
          font-family: 'Amiri', serif;
          font-size: clamp(13px, 2.8vw, 16px);
          color: rgba(212, 170, 64, 0.85);
          text-align: center;
          direction: rtl;
          margin: 0;
          font-style: italic;
        }

        .prayer-modal-footer-text-en {
          font-family: 'Lato', sans-serif;
          font-size: clamp(10px, 2vw, 12px);
          color: rgba(212,170,64,0.45);
          text-align: center;
          margin: 0;
          font-weight: 300;
        }

        .prayer-modal-actions {
          padding: clamp(12px, 2.5vw, 20px) clamp(20px, 4vw, 32px) clamp(20px, 4vw, 28px);
          border-top: 1px solid rgba(180,145,60,0.15);
        }

        .prayer-close-btn {
          width: 100%;
          padding: clamp(10px, 2.5vw, 14px) 24px;
          background: linear-gradient(135deg, rgba(180,145,60,0.2) 0%, rgba(180,145,60,0.1) 100%);
          border: 1px solid rgba(180,145,60,0.4);
          border-radius: 8px;
          color: #d4aa40;
          font-family: 'Lato', sans-serif;
          font-size: clamp(12px, 2.2vw, 14px);
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .prayer-close-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(180,145,60,0.15), transparent);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .prayer-close-btn:hover {
          background: linear-gradient(135deg, rgba(180,145,60,0.3) 0%, rgba(180,145,60,0.15) 100%);
          border-color: rgba(180,145,60,0.7);
          box-shadow: 0 4px 20px rgba(180,145,60,0.2);
          transform: translateY(-1px);
        }

        .prayer-close-btn:hover::before {
          opacity: 1;
        }

        .prayer-close-btn:active {
          transform: translateY(0);
        }

        .divider-ornament {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.4;
        }

        .divider-ornament::before,
        .divider-ornament::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(180,145,60,0.6), transparent);
        }

        .divider-ornament span {
          color: rgba(180,145,60,0.8);
          font-size: 12px;
        }

        /* Laptop-specific: ensure no overflow and comfortable spacing */
        @media (min-height: 600px) and (max-height: 800px) {
          .prayer-modal-card {
            max-height: 82vh;
          }
        }

        @media (min-height: 800px) {
          .prayer-modal-card {
            max-height: 75vh;
          }
        }

        /* Small mobile */
        @media (max-width: 360px) {
          .prayer-item {
            border-left-width: 2px;
          }
        }

        /* Landscape mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .prayer-modal-card {
            max-height: 90vh;
          }
          .prayer-modal-header {
            padding-top: 12px;
            padding-bottom: 8px;
          }
          .prayer-modal-icon {
            font-size: 22px;
            margin-bottom: 4px;
          }
        }
      `}</style>

      <div className="prayer-modal-card">
        {/* Header */}
        <div className="prayer-modal-header">
          <span className="prayer-modal-icon">☽</span>
          <p className="prayer-modal-title-ar">تذكير هام</p>
          <p className="prayer-modal-title-en">Important Reminder</p>
        </div>

        {/* Body */}
        <div className="prayer-modal-body">
          <p className="prayer-modal-lead">Don't forget to pray for:</p>

          <div className="prayer-item">
            <p className="prayer-item-ar">
              اذا واجدت اي مشاكل في الذكر او الايات تاكد من ان لغه الموقع هي الانجليزيه وليس مترجم
            </p>
            <p className="prayer-item-en">
              If you find any issues with the Azkar or verses, make sure the website language is English and not translated.
            </p>
          </div>

          <div className="prayer-item">
            <p className="prayer-item-ar">
              لا تنس ان تذكر صاحب الموقع واخوانك في غزه بالدعاء ولكم بالمثل
            </p>
            <p className="prayer-item-en">
              Don't forget to pray for the website owner and our brothers in Gaza, and may Allah reward you the same.
            </p>
          </div>

          <div className="divider-ornament">
            <span>✦</span>
          </div>

          <p className="prayer-modal-footer-text">
            تقبل الله منا ومنكم صالح الاعمال
          </p>
          <p className="prayer-modal-footer-text-en">
            May Allah accept our good deeds and yours
          </p>
        </div>

        {/* Actions */}
        <div className="prayer-modal-actions">
          <button className="prayer-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PrayerReminderModal;`2
