import React from "react";
import { AnimatePresence, motion } from "framer-motion";


interface ContactUsSliderProps {
    show: boolean;
    onClose: () => void;
    onConnectExpert: () => void;
    onRaiseEscalation: () => void;
    
}
// react-icons

const ContactUsSlider: React.FC<ContactUsSliderProps> = ({ show, onClose, onConnectExpert, onRaiseEscalation }) => {

    if (!show) return null;
    
  return (
    <>
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1049, background: "rgba(0,0,0,0.3)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="position-fixed start-0 end-0"
            style={{
              bottom: 0,
              zIndex: 1050,
            }}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <div
              className="mx-auto shadow-lg"
              style={{
                width: "100%",
                maxWidth: "31rem",      // matches your screenshot’s width
                background: "#fff",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
                padding: "1rem",
                maxHeight: "65vh",
                minHeight: "45vh",
                overflowY: "auto",
                position: "relative", 
              }}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="btn btn-light position-absolute"
                style={{ right: 12, top: 8, lineHeight: 1 }}
                aria-label="Close"
              >
                ×
              </button>

              <h5 className="text-center mb-3" style={{ fontWeight: 600, marginTop: "2rem" }}>
                Contact Us
              </h5>

              {/* Card 1 */}
              <div
                className="bg-white"
                style={{
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <p className="mb-3" style={{ fontSize: ".9rem", color: "#374151" }}>
                  Looking to connect with an expert to get your EPF related queries resolved?
                </p>
                <div className="d-flex justify-content-center">
                  <button
                  className="w-75 clickeffect"
                  onClick={onConnectExpert}
                  style={{
                    border: 0,
                    outline: 0,
                    padding: "0.625rem 1rem",
                    borderRadius: "9999px",
                    background: "#E6E8FF",   // light indigo
                    color: "#000",        // indigo text
                    fontWeight: 600,
                    fontSize: ".9rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    alignItems: "center",
                  }}
                >
                  Connect with EPF expert
                </button>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="bg-white"
                style={{
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: "1rem",
                }}
              >
                <p className="mb-3" style={{ fontSize: ".9rem", color: "#374151" }}>
                  We’re listening! Your concerns are of paramount importance to us.
                </p>
                <div className="d-flex justify-content-center">
                <button
                  onClick={onRaiseEscalation} 
                  className="w-75 clickeffect"
                  style={{
                    border: 0,
                    outline: 0,
                    padding: "0.625rem 1rem",
                    borderRadius: "9999px",
                    background: "#FFD8D8",   // light pink
                    color: "#000",        // red text
                    fontWeight: 600,
                    fontSize: ".9rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  Raise Escalation
                </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    {/* <ConnectWithExpertSlider show={showExpert} onClose={() => setShowExpert(false)} /> */}
    </>
  );
};

export default ContactUsSlider;

