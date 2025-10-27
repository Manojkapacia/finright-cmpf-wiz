import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BiSupport } from "react-icons/bi";

interface BookingFaildSliderProps {
    show: boolean;
    onClose: () => void;
    onBookCall: () => Promise<void>;
}

const BookingFaildSlider: React.FC<BookingFaildSliderProps> = ({ show, onClose, onBookCall }) => {

    const [loading, setLoading] = useState(false);

    const handleClick = async () => {


        if (loading) return; // avoid double clicks
        setLoading(true);

        try {
            await onBookCall(); // <-- must await the async function
        } catch (err) {
        } finally {
            setLoading(false); // re-enable
        }
    };

    const handleOpenContactUs = () => {

        window.dispatchEvent(new Event("open-contact-us"));
        setTimeout(() => {
            onClose();
        }, 100);
    };

    return (
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
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
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
                            padding: "1.5rem 1rem 2rem 1rem",
                            borderTopLeftRadius: "1rem",
                            borderTopRightRadius: "1rem",
                            height: "40vh"
                        }}
                        initial={{ opacity: 0, y: 200, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 200, scale: 0.7 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="btn btn-light position-absolute"
                            style={{ right: 12, top: 8, lineHeight: 1 }}
                            aria-label="Close"
                        >
                            ×
                        </button>

                        {/* Content */}
                        <motion.div
                            className="h-100 d-flex flex-column justify-content-center align-items-center text-center"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* 🔴 Error message */}
                            <p
                                style={{
                                    color: "red",
                                    fontWeight: 500,
                                    fontSize: "1.1rem",
                                    // marginBottom: "1.5rem",
                                }}
                            >
                                Something went wrong. Please try again.
                            </p>

                            <div className="text-center px-2">
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
                                        "Try Again"
                                    )}
                                </motion.button>
                            </div>


                            {/* Contact our team section */}
                            <div className=" mt-3">
                                <p
                                    style={{
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                        color: "#00124F",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    Need help? Connect with our team
                                </p>

                                <div className="d-flex justify-content-center">

                                    <div
                                        className="d-flex align-items-center justify-content-center w-75 gap-2 fw-medium"
                                        style={{
                                            fontSize: "0.9rem",
                                            border: "1px solid rgba(133, 133, 133, 0.5)",
                                            borderRadius: "0.5rem",
                                            cursor: "pointer",
                                            padding: "0.6rem 1rem",
                                            width: "75%",
                                            maxWidth: "20rem",
                                        }}
                                        onClick={handleOpenContactUs} // 👈 triggers event
                                    >
                                        <div
                                            className="d-flex align-items-center justify-content-center"
                                            style={{
                                                backgroundColor: "#B2F2E7",
                                                borderRadius: "50%",
                                                padding: "4px",
                                            }}
                                        >
                                            <BiSupport size={16} color="#000" />
                                        </div>
                                        <span style={{ color: "#000" }}>Contact Us</span>
                                    </div>

                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

}

export default BookingFaildSlider;
