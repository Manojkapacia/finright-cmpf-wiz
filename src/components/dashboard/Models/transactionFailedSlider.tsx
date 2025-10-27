import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdErrorOutline } from "react-icons/md"; // icon

interface TransactionFailedSliderProps {
  show: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

const TransactionFailedSlider: React.FC<TransactionFailedSliderProps> = ({
  show,
  onClose,
  onRetry,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay (not clickable) */}
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              zIndex: 1049,
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(2px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="position-fixed start-0 end-0"
            style={{
              bottom: 0,
              zIndex: 1050,
            }}
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
          >
            <div
              className="mx-auto shadow-lg"
              style={{
                width: "100%",
                maxWidth: "31rem",
                background: "#fff",
                borderTopLeftRadius: "1.25rem",
                borderTopRightRadius: "1.25rem",
                padding: "2rem 1.5rem",
                minHeight: "16rem",
                position: "relative",
                boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "50%",
                  width: "2rem",
                  height: "2rem",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                aria-label="Close"
              >
                ×
              </button>

              {/* Icon */}
              <div className="d-flex justify-content-center mb-3">
                <div
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "50%",
                    background: "#FEE2E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdErrorOutline size={28} color="#DC2626" />
                </div>
              </div>

              {/* Title */}
              <h5
                className="text-center mb-2"
                style={{ fontWeight: 700, fontSize: "1.25rem", color: "#111827" }}
              >
                Transaction Failed
              </h5>

              {/* Body */}
              <p
                className="text-center"
                style={{
                  fontSize: "0.95rem",
                  color: "#FD5C5C",
                  lineHeight: 1.5,
                  maxWidth: "22rem",
                  margin: "0 auto",
                }}
              >
                We could not complete your payment request. Please try again.
              </p>

              {/* Button */}
              <div className="d-flex justify-content-center mt-4">
                <button
                className="w-75"
                  style={{
                    border: "none",
                    outline: "none",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(90deg, #ef4444, #dc2626)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1rem",
                    boxShadow: "0 4px 8px rgba(239,68,68,0.3)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onClick={onRetry}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.97)")
                  }
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransactionFailedSlider;

