import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiMiniCheckBadge } from "react-icons/hi2";

interface SuccessModalProps {
  show: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // auto-close after 3 sec
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              zIndex: 1050,
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(2px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Centered Modal */}
          <motion.div
            className="position-fixed top-50 start-50 translate-middle"
            style={{ zIndex: 1051 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
          >
            <div
              className="text-center shadow-lg"
              style={{
                background: "#fff",
                borderRadius: "1rem",
                padding: "2rem 1.5rem",
                width: "22rem",
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              }}
            >
              <HiMiniCheckBadge size={48} color="#16A34A" className="mb-3" />
              <h5 style={{ fontWeight: 700, color: "#111827" }}>
                Payment Successful !!
              </h5>
              <p style={{ fontWeight: 500, color: "#111827" }}>
                Please proceed to book call with Expert !!
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;