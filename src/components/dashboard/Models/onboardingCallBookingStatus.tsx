import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

interface CallBookedSliderStatusProps {
    show: boolean;
    onClose: () => void;
    bookedDate: string;
    bookedTime: string;
    assignedExpert: string;
    caseId: string;
    handleSubmit: () => Promise<void>;
  }

const CallBookedSliderStatus: React.FC<CallBookedSliderStatusProps> = ({
    show,
    onClose,
    bookedDate,
    bookedTime,
    assignedExpert,
    caseId,
    handleSubmit,
  }) => {

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
                />

                {/* Slider */}
                <motion.div
                    className="position-fixed bottom-0 start-50 translate-middle-x w-100 shadow-lg px-4"
                    style={{
                        zIndex: 1050,
                        maxWidth: "31.25rem",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        background: "#FFFFFF",
                        padding: "1.5rem 1rem",
                        borderTopLeftRadius: "1rem",
                        borderTopRightRadius: "1rem",
                    }}
                    initial={{ opacity: 0, y: 200, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 200, scale: 0.9 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 150, damping: 12 }}
                >
                    {/* Success Circle */}
                    <motion.div
                        className="position-relative d-flex align-items-center justify-content-center mb-3 mt-2 mx-auto"
                        style={{ width: "4.375rem", height: "4.375rem" }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div
                            className="position-absolute rounded-circle"
                            style={{
                                width: "5.5rem",
                                height: "5.5rem",
                                backgroundColor: "#34A85333",
                            }}
                        />
                        <div
                            className="position-absolute rounded-circle"
                            style={{
                                width: "4.3rem",
                                height: "4.3rem",
                                backgroundColor: "#34A85333",
                            }}
                        />
                        <div
                            className="position-absolute rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                                width: "3.125rem",
                                height: "3.125rem",
                                backgroundColor: "#34A853",
                                zIndex: 2,
                            }}
                        >
                            <FaCheck size={"1rem"} color="#ffffff" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <p
                        className="text-center mt-4 mb-3"
                        style={{ fontWeight: 500, fontSize: "1.13rem" }}
                    >
                        Call Booked
                    </p>

                    {/* Card with Call Details */}
                    <div
                        style={{
                            background: "#FFFFFF",
                            borderRadius: "0.75rem",
                            boxShadow:
                                "0px -4px 12px rgba(0, 0, 0, 0.12), 0px 2px 6px rgba(0, 0, 0, 0.05)",
                            padding: "1rem 1.25rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <p style={{ marginBottom: "0.80rem", fontWeight: 500 }}>
                            Your Call Details
                        </p>

                        <div style={{ fontSize: "0.8rem" }}>
                            {[
                                ["Case ID", caseId],
                                ["Call Date", bookedDate],
                                ["Call Time", bookedTime],
                                ["Assigned SPOC", assignedExpert],
                            ].map(([label, value], index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "0.5rem 0",
                                        borderBottom: "1px solid #EAEAEA", // 👈 same line everywhere
                                    }}
                                >
                                    <div style={{ minWidth: "9.5rem"}}>{label}</div>
                                    <div style={{ flex: 1 }}>{value}</div>
                                </div>
                            ))}
                        </div>


                        {/* Message */}
                        <div
                            style={{
                                padding: "0.75rem 0",
                                textAlign: "center",
                                borderBottom: "1px solid #EAEAEA", // 👈 same line below SPOC message
                            }}
                        >
                            <p style={{ color: "#858585", fontSize: "1rem", marginBottom: "0.25rem" }}>
                                Our experts are ready
                            </p>
                            <p
                                style={{
                                    color: "#FD5C5C",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    margin: 0,
                                }}
                            >
                                Complete your profile for a meaningful discussion
                            </p>
                        </div>

                        {/* Next Button */}
                        <button
                            className="btn w-100 mt-3"
                            style={{
                                backgroundColor: "#00124F",
                                color: "white",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.5rem",
                                fontWeight: 500,
                                fontSize: "1rem",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                handleSubmit();
                                onClose();
                            }}
                        >
                            Next
                        </button>
                    </div>

                </motion.div>
            </>
            )}
        </AnimatePresence>
    );
};

export default CallBookedSliderStatus;
