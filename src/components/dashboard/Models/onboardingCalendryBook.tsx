import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import profileImage from "../../../assets/suport-profile.png";
import { MdKeyboardDoubleArrowRight, MdOutlineLocalPolice } from "react-icons/md";
interface OnboardingCalendryBookProps {
    onClose: () => void;
    handleSubmit: () => void;   // 🔹 new prop
    onBookCall: () => Promise<void>; // 🔹 new prop
}

const OnboardingCalendryBook: React.FC<OnboardingCalendryBookProps> = ({ onClose, handleSubmit, onBookCall }) => {
    const [loading, setLoading] = useState(false);
    
    const handleClick = async () => {
        if (loading) return; // avoid double clicks
        setLoading(true);
      
        try {
          await onBookCall(); // <-- must await the async function
        } catch (err) {
          console.error("Error in onBookCall:", err);
        } finally {
          setLoading(false); // re-enable
        }
      };

    return (
        <AnimatePresence>
            <>
                {/* Overlay */}
                <motion.div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 1049, background: "rgba(0,0,0,0.3)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                />

                {/* Slider Box */}
                <motion.div
                    className="position-fixed bottom-0 start-50 translate-middle-x w-100 shadow-lg px-4"
                    style={{
                        zIndex: 1050,
                        maxWidth: "31.25rem",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        background: "#FFFFFF",
                        padding: "0.5rem 1rem 1rem 1rem",
                        borderTopLeftRadius: "1rem",
                        borderTopRightRadius: "1rem",
                    }}
                    initial={{ opacity: 0, y: 200, scale: 0.7 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 200, scale: 0.7 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
                >
                    {/* Close Button */}

                    {/* <button
                        className="btn btn-light position-absolute"
                        style={{ right: 12, top: 8, lineHeight: 1 }}
                        aria-label="Close"
                        onClick={onClose}
                    >
                        ×
                    </button> */}

                    {/* Content */}
                    <motion.div
                        className="py-2 mt-5"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >

                        <p style={{ fontSize: "1.13rem", fontWeight: 500, lineHeight: "1.3", textAlign: "center", marginBottom: "2.8rem" }}>Get all your PF issues resolved</p>

                        {/* Image Box with Check + Expert Image */}
                        <center className="px-4">
                            <div
                                style={{
                                    backgroundColor: "#FFCA62",
                                    borderRadius: "1rem",
                                    height: "12.5rem",
                                    // width: "100%",
                                    width: "17rem",
                                    // maxWidth: "20.625rem",
                                    padding: "1rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    position: "relative",
                                    marginTop: "1rem",
                                }}
                            >
                                {/* Left side: Checkmark + Text */}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        padding: "0.5rem",
                                        gap: "0.5rem",
                                        zIndex: 2,
                                        height: "100%",
                                    }}
                                >

                                    <MdOutlineLocalPolice size={"2rem"} />                                        <div
                                        className="text-start"
                                        style={{ fontSize: "1rem", fontWeight: 500, lineHeight: "1.3" }}
                                    >
                                        Full<br /> Ownership<br /> with 100% <br /> transparency
                                    </div>
                                </div>

                                {/* Right side: Expert Image */}
                                <img
                                    src={profileImage}
                                    alt="Expert"
                                    style={{
                                        position: "absolute",
                                        top: "-17.5%",
                                        right: "-11%",
                                        height: "118%",
                                        objectFit: "contain",
                                        zIndex: 1,
                                    }}
                                />
                            </div>
                        </center>

                        {/* Bullet Points */}
                        <div className="mt-3 px-3">
                            <div className="d-flex align-items-center mb-2">
                                <FaCheck
                                    color="#00C7A5"
                                    size={"1.5rem"}
                                    className="me-3"
                                    style={{ marginTop: "0.2rem", flexShrink: 0 }}
                                />
                                <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                                    Get a detailed plan of action to resolve your case
                                </span>
                            </div>

                            <div className="d-flex align-items-center">
                                <FaCheck
                                    color="#00C7A5"
                                    size={"1.5rem"}
                                    className="me-3"
                                    style={{ marginTop: "0.2rem", flexShrink: 0 }}
                                />
                                <span style={{ fontSize: "1rem", fontWeight: 500 }}>
                                    We take care of end to end process and paperwork
                                </span>
                            </div>
                        </div>
                        <div className="text-center mt-4 px-2">
                            <motion.button
                                className="btn w-100"
                                style={{
                                    backgroundColor: "#00124F",   // always same color
                                    color: "white",
                                    padding: "0.75rem 1.5rem",
                                    borderRadius: "0.5rem",
                                    fontWeight: 500,
                                    fontSize: "1rem",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.85 : 1,  // slight fade to indicate disabled
                                }}
                                onClick={handleClick}
                                disabled={loading}
                                whileTap={{ scale: 0.95 }}       // 👈 click effect
                                transition={{ duration: 0.1 }}   // quick tap animation
                            >
                                {loading ? (
                                    <span className="d-flex justify-content-center align-items-center gap-2">
                                        <span
                                            className="spinner-border spinner-border-sm text-light"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Please wait...
                                    </span>
                                ) : (
                                    "Book a Call Now"
                                )}
                            </motion.button>
                        </div>
                        <div className="text-center mt-2 px-2">
                            <button
                                className="btn w-100 mt-2"

                                onClick={() => {
                                    onClose();
                                    handleSubmit();
                                }}
                                style={{
                                    backgroundColor: "white",
                                    border: "1px solid #00124F",
                                    color: "#122A7B",
                                    padding: "0.75rem 1.5rem",
                                    borderRadius: "0.5rem",
                                    fontWeight: 500,
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                }}
                            >
                                Skip For Now <MdKeyboardDoubleArrowRight size={"1.5rem"} />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </>
        </AnimatePresence>
    );
};

export default OnboardingCalendryBook;