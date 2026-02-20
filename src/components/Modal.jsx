import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ isOpen, onClose, title, children, customPadding = true }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-[#0c1a14] dark:border dark:border-white/10 shadow-2xl scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {title && (
              <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
                <h3 className="text-xl font-bold dark:text-emerald-500">{title}</h3>
              </div>
            )}

            <div className={customPadding ? "p-0" : "p-6"}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
